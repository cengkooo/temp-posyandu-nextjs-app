import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createClient as createServiceClient } from '@supabase/supabase-js';
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
  if (!url || !serviceKey) return null;

  return createServiceClient<SupabaseDatabase>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// POST /api/admin/bootstrap
// Dev-only helper: promote current authenticated user to admin by updating profiles.role.
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }

  if (process.env.ALLOW_DEV_ADMIN_BOOTSTRAP !== 'true') {
    return NextResponse.json(
      {
        error: 'Forbidden',
        hint: 'Set env ALLOW_DEV_ADMIN_BOOTSTRAP=true to enable admin bootstrap (dev only).',
      },
      { status: 403 }
    );
  }

  const { supabase, applyCookies } = createRouteSupabaseClient(request);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return applyCookies(
      NextResponse.json(
        {
          error: 'Unauthorized',
          message: userError?.message ?? null,
          hint: 'Login dulu, lalu panggil endpoint ini lagi.',
        },
        { status: 401 }
      )
    );
  }

  const service = createAdminServiceClient();
  if (!service) {
    return applyCookies(
      NextResponse.json(
        {
          error: 'Server misconfigured',
          hint: 'Set env SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) first.',
        },
        { status: 500 }
      )
    );
  }

  const { error: upsertError } = await service.from('profiles').upsert(
    {
      id: user.id,
      role: 'admin',
    },
    { onConflict: 'id' }
  );

  if (upsertError) {
    return applyCookies(
      NextResponse.json(
        {
          error: 'Failed to promote user',
          message: upsertError.message,
          hint: 'Pastikan table profiles ada dan bisa di-upsert oleh service role.',
        },
        { status: 500 }
      )
    );
  }

  return applyCookies(
    NextResponse.json({ ok: true, userId: user.id, role: 'admin' })
  );
}
