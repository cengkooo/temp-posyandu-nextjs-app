import { NextRequest, NextResponse } from 'next/server';
import { createAdminServiceClient, requireAdmin, WIPE_ORDER } from '../_utils';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
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
    const body = (await request.json().catch(() => null)) as { confirm?: string } | null;
    if (body?.confirm !== 'HAPUS') {
      return adminGate.applyCookies(
        NextResponse.json(
          {
            error: 'Bad Request',
            message: 'Konfirmasi salah. Kirim JSON {"confirm":"HAPUS"}.',
          },
          { status: 400 }
        )
      );
    }

    const deleted: Record<string, number | null> = {};

    for (const table of WIPE_ORDER) {
      const { error, count } = await service
        .from(table)
        .delete({ count: 'exact' })
        .neq('id', '__never__');

      if (error) {
        throw new Error(`${table}: ${error.message}`);
      }

      deleted[table] = count ?? null;
    }

    return adminGate.applyCookies(NextResponse.json({ ok: true, deleted }, { status: 200 }));
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return adminGate.applyCookies(
      NextResponse.json(
        {
          error: 'Wipe failed',
          message,
        },
        { status: 500 }
      )
    );
  }
}
