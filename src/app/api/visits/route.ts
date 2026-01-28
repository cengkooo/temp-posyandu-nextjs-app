import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { cachedJson, checkRateLimit } from '@/lib/upstash';

function clampInt(value: string | null, fallback: number, opts?: { min?: number; max?: number }) {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  const num = Number.isFinite(parsed) ? parsed : fallback;
  const min = opts?.min ?? Number.NEGATIVE_INFINITY;
  const max = opts?.max ?? Number.POSITIVE_INFINITY;
  return Math.min(Math.max(num, min), max);
}

function pickSort(sort: string | null) {
  const v = (sort ?? '').trim();
  if (v === 'created_at') return 'created_at';
  return 'visit_date';
}

function pickDir(dir: string | null) {
  const v = (dir ?? '').trim().toLowerCase();
  return v === 'asc' ? 'asc' : 'desc';
}

// GET /api/visits?page=1&limit=10&q=...&type=...
export async function GET(request: NextRequest) {
  try {
    const rl = await checkRateLimit(request, {
      prefix: 'api_visits_get',
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

    const page = clampInt(sp.get('page'), 1, { min: 1, max: 10_000 });
    const limit = clampInt(sp.get('limit'), 10, { min: 1, max: 100 });
    const q = (sp.get('q') ?? '').trim();
    const type = (sp.get('type') ?? '').trim();
    const sort = pickSort(sp.get('sort'));
    const dir = pickDir(sp.get('dir'));

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const cacheKey = `page=${page}:limit=${limit}:q=${encodeURIComponent(q)}:type=${encodeURIComponent(type)}:sort=${sort}:dir=${dir}`;

    const cached = await cachedJson({
      namespace: 'visits',
      key: cacheKey,
      ttlSeconds: 30,
      producer: async () => {
        let query = supabase
          .from('visits')
          .select(
            `
            *,
            patient:patients(*)
          `,
            { count: 'exact' }
          )
          .order(sort, { ascending: dir === 'asc' })
          .range(from, to);

        if (q) {
          query = query.or(`patient.full_name.ilike.%${q}%,visit_date.ilike.%${q}%`);
        }

        if (type && type !== 'all') {
          query = query.eq('patient.patient_type', type);
        }

        const { data: visits, error: visitsError, count } = await query;
        if (visitsError) throw new Error(visitsError.message);

        const safeVisits = visits ?? [];
        const createdByIds = Array.from(
          new Set(safeVisits.map((v) => v.created_by).filter(Boolean) as string[])
        );

        const { data: profiles, error: profilesError } = createdByIds.length
          ? await supabase.from('profiles').select('*').in('id', createdByIds)
          : { data: [], error: null };

        if (profilesError) throw new Error(profilesError.message);

        const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
        const combined = safeVisits.map((visit) => ({
          ...visit,
          profile: visit.created_by ? profileMap.get(visit.created_by) ?? null : null,
        }));

        const total = count ?? 0;
        return {
          data: combined,
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
    console.error('Error in GET /api/visits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
