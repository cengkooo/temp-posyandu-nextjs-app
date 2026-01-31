import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import type { SupabaseDatabase } from '@/types/database.types';

const payloadSchema = z.object({
  name: z.string().trim().min(1),
  code: z.string().trim().min(1),
  address: z.string().trim().nullable().optional(),
  kelurahan: z.string().trim().nullable().optional(),
  kecamatan: z.string().trim().nullable().optional(),
  kota: z.string().trim().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  email: z.string().trim().email().nullable().optional(),
  puskesmas: z.string().trim().nullable().optional(),
  ketua: z.string().trim().nullable().optional(),
  operationalDays: z.array(z.string().trim().min(1)).optional(),
  operationalHours: z.string().trim().nullable().optional(),
});

function asNullIfEmpty(value: string | null | undefined) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function hintFromPostgresCode(code: string | null | undefined) {
  if (!code) return null;
  if (code === 'PGRST205') {
    return 'Table posyandu_settings belum ada (schema cache). Jalankan migrations/00_supabase_schema.sql di Supabase, lalu coba lagi.';
  }
  if (code === '42P01') {
    return 'Table posyandu_settings belum ada. Jalankan migrations/00_supabase_schema.sql di Supabase.';
  }
  if (code === '42501') {
    return 'Permission denied. Cek RLS/policy posyandu_settings dan role user (profiles.role = admin untuk update).';
  }
  return null;
}

type NextCookieOptions = Parameters<NextResponse['cookies']['set']>[2];
type CookieToSet = { name: string; value: string; options?: NextCookieOptions };

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
      cookiesToSet.forEach((c) => {
        res.cookies.set(c.name, c.value, { ...c.options, path: '/' });
      });
      return res;
    },
  };
}

export async function GET(request: NextRequest) {
  const { supabase, applyCookies } = createRouteSupabaseClient(request);

  const { data: row, error } = await supabase
    .from('posyandu_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('GET /api/settings/posyandu error:', error);
    return applyCookies(
      NextResponse.json(
      {
        error: 'Failed to load settings',
        code: error.code,
        message: error.message,
        hint: hintFromPostgresCode(error.code),
      },
      { status: 500 }
      )
    );
  }

  return applyCookies(
    NextResponse.json({
      data: row,
    })
  );
}

export async function PUT(request: NextRequest) {
  const { supabase, applyCookies } = createRouteSupabaseClient(request);

  const body = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return applyCookies(
      NextResponse.json(
      { error: 'Invalid payload', details: parsed.error.flatten() },
      { status: 400 }
      )
    );
  }

  const v = parsed.data;

  // Upsert into singleton row.
  const { data: existing, error: existingError } = await supabase
    .from('posyandu_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (existingError) {
    console.error('PUT /api/settings/posyandu existingError:', existingError);
    return applyCookies(
      NextResponse.json(
      {
        error: 'Failed to load settings',
        code: existingError.code,
        message: existingError.message,
        hint: hintFromPostgresCode(existingError.code),
      },
      { status: 500 }
      )
    );
  }

  const update = {
    name: v.name,
    code: v.code,
    address: asNullIfEmpty(v.address) ?? null,
    kelurahan: asNullIfEmpty(v.kelurahan) ?? null,
    kecamatan: asNullIfEmpty(v.kecamatan) ?? null,
    kota: asNullIfEmpty(v.kota) ?? null,
    phone: asNullIfEmpty(v.phone) ?? null,
    email: asNullIfEmpty(v.email) ?? null,
    puskesmas: asNullIfEmpty(v.puskesmas) ?? null,
    ketua: asNullIfEmpty(v.ketua) ?? null,
    operational_days: v.operationalDays ?? [],
    operational_hours: asNullIfEmpty(v.operationalHours) ?? null,
  };

  const { data: saved, error: saveError } = existing?.id
    ? await supabase
        .from('posyandu_settings')
        .update(update)
        .eq('id', existing.id)
        .select('*')
        .single()
    : await supabase.from('posyandu_settings').insert(update).select('*').single();

  if (saveError) {
    console.error('PUT /api/settings/posyandu saveError:', saveError);
    // Common case: RLS blocks update.
    return applyCookies(
      NextResponse.json(
      {
        error: 'Failed to save settings',
        code: saveError.code,
        message: saveError.message,
        hint: hintFromPostgresCode(saveError.code),
      },
      { status: 403 }
      )
    );
  }

  return applyCookies(NextResponse.json({ data: saved }));
}
