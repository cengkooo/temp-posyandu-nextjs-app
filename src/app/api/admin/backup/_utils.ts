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

export const BACKUP_TABLES = [
  'posyandu_settings',
  'patients',
  'pregnancies',
  'visits',
  'immunizations',
  'patient_extended_data',
  'schedules',
  'announcements',
  'gallery',
  'audit_logs',
] as const;

export type BackupTableName = (typeof BACKUP_TABLES)[number];

export const RESTORE_ORDER: BackupTableName[] = [
  'posyandu_settings',
  'patients',
  'schedules',
  'announcements',
  'gallery',
  'pregnancies',
  'visits',
  'immunizations',
  'patient_extended_data',
  'audit_logs',
];

export const WIPE_ORDER: BackupTableName[] = [
  'audit_logs',
  'patient_extended_data',
  'immunizations',
  'visits',
  'pregnancies',
  'gallery',
  'announcements',
  'schedules',
  'patients',
  'posyandu_settings',
];

export function createRouteSupabaseClient(request: NextRequest) {
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

export function createAdminServiceClient() {
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

export async function requireAdmin(request: NextRequest) {
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
        NextResponse.json(
          { error: 'Failed to verify role', message: profileError.message },
          { status: 500 }
        )
      ),
    } as const;
  }

  if (!profile || profile.role !== 'admin') {
    return {
      response: applyCookies(
        NextResponse.json(
          {
            error: 'Forbidden',
            hint: 'Akun ini bukan admin. Set profiles.role = "admin" untuk user ini agar bisa kelola backup/restore.',
            role: profile?.role ?? null,
          },
          { status: 403 }
        )
      ),
    } as const;
  }

  return { user, applyCookies } as const;
}

export async function fetchAllRows(
  serviceClient: ReturnType<typeof createAdminServiceClient>,
  table: BackupTableName,
  opts?: { pageSize?: number }
) {
  if (!serviceClient) {
    throw new Error('Missing service client');
  }

  const pageSize = opts?.pageSize ?? 1000;
  const allRows: unknown[] = [];

  let offset = 0;
  while (true) {
    const { data, error } = await serviceClient
      .from(table)
      .select('*')
      .range(offset, offset + pageSize - 1);

    if (error) {
      throw new Error(`${table}: ${error.message}`);
    }

    const batch = (data ?? []) as unknown[];
    allRows.push(...batch);

    if (batch.length < pageSize) {
      break;
    }

    offset += pageSize;
  }

  return allRows;
}

export function chunkArray<T>(items: T[], chunkSize: number): T[][] {
  if (chunkSize <= 0) {
    return [items];
  }
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }
  return chunks;
}

export function normalizePosyanduSettingsRow(row: Record<string, unknown>) {
  const operationalDays = row['operational_days'];
  if (Array.isArray(operationalDays)) {
    return row;
  }
  if (typeof operationalDays === 'string') {
    return {
      ...row,
      operational_days: operationalDays
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
  }
  return { ...row, operational_days: [] };
}

export function tryParseJsonValue(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) return value;
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}
