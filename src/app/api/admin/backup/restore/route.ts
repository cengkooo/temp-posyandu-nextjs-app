import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import {
  BACKUP_TABLES,
  RESTORE_ORDER,
  WIPE_ORDER,
  chunkArray,
  createAdminServiceClient,
  normalizePosyanduSettingsRow,
  requireAdmin,
  tryParseJsonValue,
  type BackupTableName,
} from '../_utils';

export const runtime = 'nodejs';

type BackupPayload = {
  version?: number;
  generatedAt?: string;
  tables?: Record<string, unknown[]>;
};

function isBackupTableName(value: string): value is BackupTableName {
  return (BACKUP_TABLES as readonly string[]).includes(value);
}

function parseBackupFromJson(text: string): BackupPayload {
  const parsed = JSON.parse(text) as unknown;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid JSON backup');
  }
  return parsed as BackupPayload;
}

function parseBackupFromExcel(buffer: ArrayBuffer): BackupPayload {
  const wb = XLSX.read(buffer, { type: 'array' });
  const tables: Record<string, unknown[]> = {};

  for (const sheetName of wb.SheetNames) {
    if (sheetName === '_meta') continue;
    if (!isBackupTableName(sheetName)) continue;

    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: null }) as Record<string, unknown>[];

    const normalized = rows.map((row) => {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(row)) {
        out[k] = tryParseJsonValue(v);
      }
      if (sheetName === 'posyandu_settings') {
        return normalizePosyanduSettingsRow(out);
      }
      return out;
    });

    tables[sheetName] = normalized;
  }

  return { version: 1, tables };
}

async function wipeAll(service: NonNullable<ReturnType<typeof createAdminServiceClient>>) {
  for (const table of WIPE_ORDER) {
    const { error } = await service.from(table).delete().neq('id', '__never__');
    if (error) {
      throw new Error(`wipe ${table}: ${error.message}`);
    }
  }
}

async function upsertTable(
  service: NonNullable<ReturnType<typeof createAdminServiceClient>>,
  table: BackupTableName,
  rows: unknown[]
) {
  if (!rows.length) return { inserted: 0 };

  const chunks = chunkArray(rows as Record<string, unknown>[], 500);
  let total = 0;

  for (const chunk of chunks) {
    // Ensure posyandu_settings operational_days is array.
    const dataChunk =
      table === 'posyandu_settings'
        ? chunk.map((r) => normalizePosyanduSettingsRow(r))
        : chunk;

    const { error } = await service.from(table).upsert(dataChunk as never, { onConflict: 'id' });
    if (error) {
      throw new Error(`restore ${table}: ${error.message}`);
    }
    total += chunk.length;
  }

  return { inserted: total };
}

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
    const form = await request.formData();
    const file = form.get('file');
    const modeRaw = form.get('mode');

    const mode = modeRaw === 'replace' ? 'replace' : 'merge';

    if (!(file instanceof File)) {
      return adminGate.applyCookies(
        NextResponse.json({ error: 'Bad Request', message: 'File backup wajib diupload (field: file).' }, { status: 400 })
      );
    }

    const name = file.name?.toLowerCase?.() ?? '';
    const contentType = file.type ?? '';

    let payload: BackupPayload;

    if (name.endsWith('.json') || contentType.includes('json')) {
      const text = await file.text();
      payload = parseBackupFromJson(text);
    } else if (name.endsWith('.xlsx') || contentType.includes('spreadsheet') || contentType.includes('excel')) {
      const buffer = await file.arrayBuffer();
      payload = parseBackupFromExcel(buffer);
    } else {
      return adminGate.applyCookies(
        NextResponse.json(
          { error: 'Bad Request', message: 'Format tidak didukung. Gunakan .json atau .xlsx' },
          { status: 400 }
        )
      );
    }

    const tables = payload.tables ?? {};

    if (Object.keys(tables).length === 0) {
      return adminGate.applyCookies(
        NextResponse.json({ error: 'Bad Request', message: 'Backup tidak berisi tabel yang dikenali.' }, { status: 400 })
      );
    }

    if (mode === 'replace') {
      await wipeAll(service);
    }

    const results: Record<string, number> = {};

    for (const table of RESTORE_ORDER) {
      const rows = tables[table] ?? [];
      if (!Array.isArray(rows)) continue;
      const { inserted } = await upsertTable(service, table, rows);
      results[table] = inserted;
    }

    return adminGate.applyCookies(
      NextResponse.json(
        {
          ok: true,
          mode,
          restored: results,
        },
        { status: 200 }
      )
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return adminGate.applyCookies(
      NextResponse.json(
        {
          error: 'Restore failed',
          message,
        },
        { status: 500 }
      )
    );
  }
}
