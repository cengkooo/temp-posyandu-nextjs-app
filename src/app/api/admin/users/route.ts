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
    return {
      response: applyCookies(NextResponse.json({ error: 'Unauthorized' }, { status: 401 })),
    } as const;
  }

  if (!user) {
    return {
      response: applyCookies(NextResponse.json({ error: 'Unauthorized' }, { status: 401 })),
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
      response: applyCookies(NextResponse.json({ error: 'Forbidden' }, { status: 403 })),
    } as const;
  }

  return { supabase, applyCookies, user } as const;
}

const roleSchema = z.enum(['admin', 'bidan', 'kader']);

const createUserSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  phone: z.string().trim().optional().nullable(),
  role: roleSchema,
  password: z.string().min(8).optional().nullable(),
});

// GET /api/admin/users
export async function GET(request: NextRequest) {
  const adminGate = await requireAdmin(request);
  if ('response' in adminGate) return adminGate.response;

  const service = createAdminServiceClient();
  if (!service) {
    return adminGate.applyCookies(
      NextResponse.json(
        {
          error: 'Server misconfigured',
          hint: 'Set env SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) to enable user management (create/edit/delete/list auth users).',
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

  const sp = request.nextUrl.searchParams;
  const page = Math.max(1, Number.parseInt(sp.get('page') ?? '1', 10) || 1);
  const perPage = Math.min(200, Math.max(1, Number.parseInt(sp.get('perPage') ?? '50', 10) || 50));

  try {
    const { data: list, error: listError } = await service.auth.admin.listUsers({ page, perPage });
    if (listError) {
      return adminGate.applyCookies(
        NextResponse.json({ error: 'Failed to list users', message: listError.message }, { status: 500 })
      );
    }

    const authUsers = list?.users ?? [];
    const ids = authUsers.map((u) => u.id);

    const { data: profiles, error: profilesError } = ids.length
      ? await service.from('profiles').select('id, full_name, phone, role').in('id', ids)
      : { data: [], error: null };

    if (profilesError) {
      return adminGate.applyCookies(
        NextResponse.json({ error: 'Failed to load profiles', message: profilesError.message }, { status: 500 })
      );
    }

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));

    const data = authUsers.map((u) => {
      const p = profileMap.get(u.id);
      const role = (p?.role ?? 'kader') as z.infer<typeof roleSchema>;

      return {
        id: u.id,
        name: p?.full_name ?? (u.user_metadata?.full_name as string | undefined) ?? u.email ?? '-',
        email: u.email ?? null,
        phone: p?.phone ?? (u.user_metadata?.phone as string | undefined) ?? null,
        role,
        status: u.banned_until ? 'inactive' : 'active',
        lastLogin: u.last_sign_in_at ?? null,
      };
    });

    return adminGate.applyCookies(
      NextResponse.json({
        data,
        page,
        perPage,
        total: list?.total ?? data.length,
        currentUserId: adminGate.user.id,
      })
    );
  } catch (error) {
    console.error('GET /api/admin/users error:', error);
    return adminGate.applyCookies(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
  }
}

// POST /api/admin/users
export async function POST(request: NextRequest) {
  const adminGate = await requireAdmin(request);
  if ('response' in adminGate) return adminGate.response;

  const service = createAdminServiceClient();
  if (!service) {
    return adminGate.applyCookies(
      NextResponse.json(
        {
          error: 'Server misconfigured',
          hint: 'Set env SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) to enable user management (create/edit/delete).',
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

  const body = await request.json().catch(() => null);
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return adminGate.applyCookies(
      NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 })
    );
  }

  const v = parsed.data;

  try {
    const { data: created, error: createError } = await service.auth.admin.createUser({
      email: v.email,
      password: v.password ?? undefined,
      email_confirm: true,
      user_metadata: {
        full_name: v.name,
        phone: v.phone ?? null,
      },
    });

    if (createError || !created.user) {
      return adminGate.applyCookies(
        NextResponse.json(
          { error: 'Failed to create user', message: createError?.message ?? 'Unknown error' },
          { status: 500 }
        )
      );
    }

    const userId = created.user.id;

    const { error: upsertError } = await service.from('profiles').upsert(
      {
        id: userId,
        full_name: v.name,
        phone: v.phone ?? null,
        role: v.role,
      },
      { onConflict: 'id' }
    );

    if (upsertError) {
      return adminGate.applyCookies(
        NextResponse.json(
          { error: 'User created, but failed to save profile', message: upsertError.message },
          { status: 500 }
        )
      );
    }

    return adminGate.applyCookies(
      NextResponse.json(
        {
          data: {
            id: userId,
            name: v.name,
            email: created.user.email ?? v.email,
            phone: v.phone ?? null,
            role: v.role,
            status: 'active',
            lastLogin: created.user.last_sign_in_at ?? null,
          },
        },
        { status: 201 }
      )
    );
  } catch (error) {
    console.error('POST /api/admin/users error:', error);
    return adminGate.applyCookies(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
  }
}
