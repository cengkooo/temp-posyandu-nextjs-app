import { NextRequest, NextResponse } from 'next/server';
import { BACKUP_TABLES, createAdminServiceClient, fetchAllRows, requireAdmin } from '../_utils';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const adminGate = await requireAdmin(request);
  if ('response' in adminGate) return adminGate.response;

  const service = createAdminServiceClient();
  if (!service) {
    return adminGate.applyCookies(
      NextResponse.json(
        {
          error: 'Missing service key',
          hint: 'Set env SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY) untuk export/restore/wipe backup.',
        },
        { status: 500 }
      )
    );
  }

  try {
    const tables: Record<string, unknown[]> = {};
    const counts: Record<string, number> = {};

    for (const table of BACKUP_TABLES) {
      const rows = await fetchAllRows(service, table);
      tables[table] = rows;
      counts[table] = rows.length;
    }

    const payload = {
      version: 1,
      generatedAt: new Date().toISOString(),
      counts,
      tables,
    };

    const filename = `posyandu_backup_${new Date().toISOString().slice(0, 10)}.json`;

    const res = NextResponse.json(payload, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

    return adminGate.applyCookies(res);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return adminGate.applyCookies(
      NextResponse.json(
        {
          error: 'Backup failed',
          message,
          hint: message.toLowerCase().includes('fetch failed')
            ? 'Server gagal konek ke Supabase (fetch failed/timeout). Coba lagi atau cek koneksi.'
            : undefined,
        },
        { status: 500 }
      )
    );
  }
}
