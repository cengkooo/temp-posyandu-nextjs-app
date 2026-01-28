import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { cachedJson, checkRateLimit } from '@/lib/upstash';

type PatientType = 'bayi' | 'balita' | 'ibu_hamil' | 'remaja_dewasa' | 'lansia';
type Gender = 'L' | 'P';

function clampInt(value: string | null, fallback: number, opts?: { min?: number; max?: number }) {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  const num = Number.isFinite(parsed) ? parsed : fallback;
  const min = opts?.min ?? Number.NEGATIVE_INFINITY;
  const max = opts?.max ?? Number.POSITIVE_INFINITY;
  return Math.min(Math.max(num, min), max);
}

function pickSort(sort: string | null) {
  const v = (sort ?? '').trim();
  if (v === 'full_name') return 'full_name';
  return 'created_at';
}

function pickDir(dir: string | null) {
  const v = (dir ?? '').trim().toLowerCase();
  return v === 'asc' ? 'asc' : 'desc';
}

function pickPatientType(type: string | null): PatientType | null {
  const v = (type ?? '').trim();
  if (v === 'bayi') return 'bayi';
  if (v === 'balita') return 'balita';
  if (v === 'ibu_hamil') return 'ibu_hamil';
  if (v === 'remaja_dewasa') return 'remaja_dewasa';
  if (v === 'lansia') return 'lansia';
  return null;
}

function pickGender(gender: string | null): Gender | null {
  const v = (gender ?? '').trim();
  if (v === 'L') return 'L';
  if (v === 'P') return 'P';
  return null;
}

// GET /api/patients?page=1&limit=10&q=...&type=...&gender=...&sort=...&dir=...
export async function GET(request: NextRequest) {
  try {
    const rl = await checkRateLimit(request, {
      prefix: 'api_patients_get',
      limit: 240,
      window: '1 m',
    });

    if (!('bypass' in rl) && !rl.ok) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'x-ratelimit-limit': String(rl.limit),
            'x-ratelimit-remaining': String(rl.remaining),
            'x-ratelimit-reset': String(rl.reset),
          },
        }
      );
    }

    const supabase = createClient();
    const sp = request.nextUrl.searchParams;

    const page = clampInt(sp.get('page'), 1, { min: 1, max: 100_000 });
    const limit = clampInt(sp.get('limit'), 10, { min: 1, max: 200 });
    const q = (sp.get('q') ?? '').trim();
    const type = pickPatientType(sp.get('type'));
    const gender = pickGender(sp.get('gender'));
    const sort = pickSort(sp.get('sort'));
    const dir = pickDir(sp.get('dir'));

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const cacheKey = `page=${page}:limit=${limit}:q=${encodeURIComponent(q)}:type=${encodeURIComponent(type ?? '')}:gender=${encodeURIComponent(gender ?? '')}:sort=${sort}:dir=${dir}`;

    const cached = await cachedJson({
      namespace: 'patients',
      key: cacheKey,
      ttlSeconds: 30,
      producer: async () => {
        let query = supabase
          .from('patients')
          .select('*', { count: 'exact' })
          .order(sort, { ascending: dir === 'asc' })
          .range(from, to);

        if (q) {
          query = query.or(`full_name.ilike.%${q}%,nik.ilike.%${q}%,phone.ilike.%${q}%`);
        }

        if (type) query = query.eq('patient_type', type);
        if (gender) query = query.eq('gender', gender);

        const { data, error, count } = await query;
        if (error) throw new Error(error.message);

        const total = count ?? 0;
        return {
          data: data ?? [],
          page,
          limit,
          total,
          totalPages: total > 0 ? Math.ceil(total / limit) : 0,
        };
      },
    });

    return NextResponse.json(cached.value, {
      headers: {
        'x-cache': cached.cache,
        ...(!('bypass' in rl)
          ? {
              'x-ratelimit-limit': String(rl.limit),
              'x-ratelimit-remaining': String(rl.remaining),
              'x-ratelimit-reset': String(rl.reset),
            }
          : {}),
      },
    });
  } catch (error) {
    console.error('Error in GET /api/patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
