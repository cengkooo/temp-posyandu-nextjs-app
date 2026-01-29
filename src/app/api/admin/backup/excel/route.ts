import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import {
  BACKUP_TABLES,
  createAdminServiceClient,
  fetchAllRows,
  requireAdmin,
} from '../_utils';

export const runtime = 'nodejs';

function toExcelSafeRows(table: string, rows: unknown[]) {
  const jsonFieldsByTable: Record<string, string[]> = {
    patient_extended_data: [
      'immunizations',
      'chronic_diseases',
      'current_medications',
      'education_given',
    ],
    audit_logs: ['changes'],
  };

  const jsonFields = jsonFieldsByTable[table] ?? [];

  return (rows as Record<string, unknown>[]).map((row) => {
    const out: Record<string, unknown> = { ...row };

    // Keep arrays/objects stable in Excel by stringifying.
    for (const key of Object.keys(out)) {
      const value = out[key];
      if (Array.isArray(value)) {
        out[key] = JSON.stringify(value);
      }
    }

    for (const field of jsonFields) {
      const value = out[field];
      if (value && typeof value === 'object') {
        out[field] = JSON.stringify(value);
      }
    }

    // A tiny convenience: if JSON already a string, keep as-is.
    return out;
  });
}

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
    const wb = XLSX.utils.book_new();

    const metaRows = [
      { key: 'version', value: 1 },
      { key: 'generatedAt', value: new Date().toISOString() },
      { key: 'note', value: 'Backup tables are in separate sheets.' },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(metaRows), '_meta');

    for (const table of BACKUP_TABLES) {
      const rows = await fetchAllRows(service, table);
      const excelRows = toExcelSafeRows(table, rows);
      const sheet = XLSX.utils.json_to_sheet(excelRows);
      XLSX.utils.book_append_sheet(wb, sheet, table);
    }

    const data = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
    const filename = `posyandu_backup_${new Date().toISOString().slice(0, 10)}.xlsx`;

    const res = new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
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
