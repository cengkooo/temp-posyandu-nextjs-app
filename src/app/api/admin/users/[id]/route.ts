import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { z } from 'zod';
import type { SupabaseDatabase } from '@/types/database.types';

type NextCookieOptions = Parameters<NextResponse['cookies']['set']>[2];

type CookieToSet = {
  name: string;
  value: string;
  options?: NextCookieOptions;
};

function createRouteSupabaseClient(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  const cookiesToSet: CookieToSet[] = [];

  const supabase = createServerClient<SupabaseDatabase>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(incoming) {
        cookiesToSet.push(...incoming);
      },
    },
  });

  return {
    supabase,
    applyCookies(res: NextResponse) {
      cookiesToSet.forEach((c) => res.cookies.set(c.name, c.value, { ...c.options, path: '/' }));
      return res;
    },
  };
}

function createAdminServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE;
  if (!url || !serviceKey) {
    return null;
  }
  return createServiceClient<SupabaseDatabase>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function requireAdmin(request: NextRequest) {
  const { supabase, applyCookies } = createRouteSupabaseClient(request);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    const msg = userError.message ?? 'Unknown auth error';
    return {
      response: applyCookies(
        NextResponse.json(
          {
            error: 'Unauthorized',
            message: msg,
            hint: msg.toLowerCase().includes('fetch failed')
              ? 'Server gagal konek ke Supabase (fetch failed/timeout). Cek koneksi internet/VPN/firewall ke *.supabase.co.'
              : 'Silakan login ulang, lalu coba lagi.',
          },
          { status: 401 }
        )
      ),
    } as const;
  }

  if (!user) {
    return {
      response: applyCookies(
        NextResponse.json(
          {
            error: 'Unauthorized',
            hint: 'Session tidak ditemukan. Silakan login ulang.',
          },
          { status: 401 }
        )
      ),
    } as const;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return {
      response: applyCookies(
        NextResponse.json({ error: 'Failed to verify role', message: profileError.message }, { status: 500 })
      ),
    } as const;
  }

  if (!profile || profile.role !== 'admin') {
    return {
      response: applyCookies(
        NextResponse.json(
          {
            error: 'Forbidden',
            hint: 'Akun ini bukan admin. Set profiles.role = "admin" untuk user ini agar bisa kelola pengguna.',
            role: profile?.role ?? null,
          },
          { status: 403 }
        )
      ),
    } as const;
  }

  return { applyCookies, user } as const;
}

const roleSchema = z.enum(['admin', 'bidan', 'kader']);

const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    phone: z.string().trim().optional().nullable(),
    role: roleSchema.optional(),
    email: z.string().trim().email().optional(),
    password: z.string().min(8).optional().nullable(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: 'Empty payload' });

// PATCH /api/admin/users/:id
export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const adminGate = await requireAdmin(request);
  if ('response' in adminGate) return adminGate.response;

  const service = createAdminServiceClient();
  if (!service) {
    return adminGate.applyCookies(
      NextResponse.json(
        {
          error: 'Server misconfigured',
          hint: 'Set env SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) to enable user management (edit/delete).',
          debug: {
            hasSupabaseUrl: Boolean(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL),
            hasServiceKey: Boolean(
              process.env.SUPABASE_SERVICE_ROLE_KEY ??
                process.env.SUPABASE_SERVICE_KEY ??
                process.env.SUPABASE_SERVICE_ROLE
            ),
          },
        },
        { status: 500 }
      )
    );
  }

  const { id } = await ctx.params;

  const body = await request.json().catch(() => null);
  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return adminGate.applyCookies(
      NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    );
  }

  const v = parsed.data;

  try {
    if (v.email || v.password) {
      const { error: updateAuthError } = await service.auth.admin.updateUserById(id, {
        ...(v.email ? { email: v.email } : {}),
        ...(v.password ? { password: v.password } : {}),
      });

      if (updateAuthError) {
        return adminGate.applyCookies(
          NextResponse.json({ error: 'Failed to update auth user', message: updateAuthError.message }, { status: 500 })
        );
      }
    }

    if (v.name || v.phone !== undefined || v.role) {
      const updateProfile: Record<string, unknown> = {};
      if (v.name) updateProfile.full_name = v.name;
      if (v.phone !== undefined) updateProfile.phone = v.phone ?? null;
      if (v.role) updateProfile.role = v.role;

      const { error: profileError } = await service.from('profiles').update(updateProfile).eq('id', id);
      if (profileError) {
        return adminGate.applyCookies(
          NextResponse.json({ error: 'Failed to update profile', message: profileError.message }, { status: 500 })
        );
      }
    }

    return adminGate.applyCookies(NextResponse.json({ ok: true }));
  } catch (error) {
    console.error('PATCH /api/admin/users/[id] error:', error);
    return adminGate.applyCookies(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
  }
}

// DELETE /api/admin/users/:id
export async function DELETE(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const adminGate = await requireAdmin(request);
  if ('response' in adminGate) return adminGate.response;

  const service = createAdminServiceClient();
  if (!service) {
    return adminGate.applyCookies(
      NextResponse.json(
        {
          error: 'Server misconfigured',
          hint: 'Set env SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) to enable user management (delete).',
          debug: {
            hasSupabaseUrl: Boolean(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL),
            hasServiceKey: Boolean(
              process.env.SUPABASE_SERVICE_ROLE_KEY ??
                process.env.SUPABASE_SERVICE_KEY ??
                process.env.SUPABASE_SERVICE_ROLE
            ),
          },
        },
        { status: 500 }
      )
    );
  }

  const { id } = await ctx.params;

  // Prevent deleting yourself.
  if (id === adminGate.user.id) {
    return adminGate.applyCookies(
      NextResponse.json({ error: 'Cannot delete current user' }, { status: 400 })
    );
  }

  try {
    const { error: deleteAuthError } = await service.auth.admin.deleteUser(id);
    if (deleteAuthError) {
      return adminGate.applyCookies(
        NextResponse.json({ error: 'Failed to delete auth user', message: deleteAuthError.message }, { status: 500 })
      );
    }

    // Best-effort cleanup: delete profile.
    await service.from('profiles').delete().eq('id', id);

    return adminGate.applyCookies(NextResponse.json({ ok: true }));
  } catch (error) {
    console.error('DELETE /api/admin/users/[id] error:', error);
    return adminGate.applyCookies(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
  }
}
