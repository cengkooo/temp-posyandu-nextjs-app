import { NextRequest, NextResponse } from 'next/server';
import { format, startOfMonth, subMonths, addMonths } from 'date-fns';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { cachedJson, checkRateLimit } from '@/lib/upstash';

type NutritionalStatus = {
  status: 'Gizi Baik' | 'Gizi Kurang' | 'Gizi Buruk' | 'Stunting';
  count: number;
  percentage: number;
  color: string;
};

type DashboardSummary = {
  totalPatients: number;
  visitsThisMonth: number;
  immunizationsPending: number;
  balitaGiziBuruk: number;
};

type VisitTrend = {
  month: string;
  bayi: number;
  balita: number;
  ibu_hamil: number;
  remaja_dewasa: number;
  lansia: number;
  total: number;
};

type RecentVisitRow = {
  name: string;
  type: string;
  date: string;
  officer: string;
  typeColor: string;
};

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  bayi: { label: 'Bayi', className: 'text-blue-600 bg-blue-50' },
  balita: { label: 'Balita', className: 'text-teal-600 bg-teal-50' },
  ibu_hamil: { label: 'Ibu Hamil', className: 'text-orange-600 bg-orange-50' },
  remaja_dewasa: { label: 'Remaja/Dewasa', className: 'text-purple-600 bg-purple-50' },
  lansia: { label: 'Lansia', className: 'text-amber-700 bg-amber-50' },
};

type PatientTypeKey = 'bayi' | 'balita' | 'ibu_hamil' | 'remaja_dewasa' | 'lansia';
function isPatientTypeKey(value: string): value is PatientTypeKey {
  return value === 'bayi'
    || value === 'balita'
    || value === 'ibu_hamil'
    || value === 'remaja_dewasa'
    || value === 'lansia';
}

function clampInt(value: string | null, fallback: number, opts?: { min?: number; max?: number }) {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  const num = Number.isFinite(parsed) ? parsed : fallback;
  const min = opts?.min ?? Number.NEGATIVE_INFINITY;
  const max = opts?.max ?? Number.POSITIVE_INFINITY;
  return Math.min(Math.max(num, min), max);
}

async function getSummary(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>): Promise<DashboardSummary> {
  const { count: totalPatients, error: patientsError } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  const thisMonthStart = startOfMonth(new Date());
  const nextMonthStart = addMonths(thisMonthStart, 1);

  const { count: visitsThisMonth, error: visitsError } = await supabase
    .from('visits')
    .select('*', { count: 'exact', head: true })
    .gte('visit_date', thisMonthStart.toISOString())
    .lt('visit_date', nextMonthStart.toISOString());

  const today = format(new Date(), 'yyyy-MM-dd');
  const { count: immunizationsPending, error: immunizationsError } = await supabase
    .from('immunizations')
    .select('*', { count: 'exact', head: true })
    .not('next_schedule', 'is', null)
    .lte('next_schedule', today);

  // We compute balitaGiziBuruk separately based on nutrition data.
  // But if any query errors, keep best-effort zero.
  if (patientsError) console.warn('dashboard summary patientsError:', patientsError);
  if (visitsError) console.warn('dashboard summary visitsError:', visitsError);
  if (immunizationsError) console.warn('dashboard summary immunizationsError:', immunizationsError);

  return {
    totalPatients: patientsError ? 0 : (totalPatients ?? 0),
    visitsThisMonth: visitsError ? 0 : (visitsThisMonth ?? 0),
    immunizationsPending: immunizationsError ? 0 : (immunizationsPending ?? 0),
    balitaGiziBuruk: 0,
  };
}

async function getNutrition(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>
): Promise<NutritionalStatus[]> {
  const empty = [
    { status: 'Gizi Baik', count: 0, percentage: 0, color: '#10b981' },
    { status: 'Gizi Kurang', count: 0, percentage: 0, color: '#f59e0b' },
    { status: 'Gizi Buruk', count: 0, percentage: 0, color: '#ef4444' },
    { status: 'Stunting', count: 0, percentage: 0, color: '#6366f1' },
  ] satisfies NutritionalStatus[];

  // Fast path: use SQL aggregation (requires migration 04_dashboard_fast_aggregates.sql).
  const { data: rows, error } = await supabase.rpc('dashboard_nutrition_counts');
  if (error) {
    console.warn('dashboard nutrition rpc error:', error);
    return empty;
  }

  const counts = new Map<string, number>();
  (rows ?? []).forEach((r) => {
    counts.set(String(r.status), Number(r.count) || 0);
  });

  const total = Array.from(counts.values()).reduce((sum, n) => sum + n, 0);
  const pct = (n: number) => (total > 0 ? (n / total) * 100 : 0);

  return empty.map((row) => {
    const count = counts.get(row.status) || 0;
    return { ...row, count, percentage: pct(count) };
  });
}

async function getVisitTrends(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  months: number
): Promise<VisitTrend[]> {
  const end = new Date();
  const start = subMonths(end, Math.max(1, months) - 1);
  const startDate = startOfMonth(start).toISOString();
  const endDate = addMonths(startOfMonth(end), 1).toISOString();

  const monthKeys: string[] = [];
  const buckets: Record<string, VisitTrend> = {};
  for (let i = 0; i < Math.max(1, months); i += 1) {
    const d = addMonths(startOfMonth(start), i);
    const key = format(d, 'yyyy-MM');
    monthKeys.push(key);
    buckets[key] = {
      month: format(d, 'MMM'),
      bayi: 0,
      balita: 0,
      ibu_hamil: 0,
      remaja_dewasa: 0,
      lansia: 0,
      total: 0,
    };
  }

  // Fast path: aggregated in SQL (requires migration 04_dashboard_fast_aggregates.sql).
  const { data: rows, error } = await supabase.rpc('dashboard_visit_trends', {
    start_date: startDate,
    end_date: endDate,
  });

  if (error) {
    console.warn('dashboard trends rpc error:', error);
    return monthKeys.map((k) => buckets[k]);
  }

  (rows ?? []).forEach((r) => {
    const d = new Date(r.month);
    const key = format(d, 'yyyy-MM');
    const type = String(r.patient_type);
    const total = Number(r.total) || 0;
    const bucket = buckets[key];
    if (!bucket) return;
    if (isPatientTypeKey(type)) {
      bucket[type] += total;
      bucket.total += total;
    }
  });

  return monthKeys.map((k) => buckets[k]);
}

async function getRecentVisits(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  limit: number
): Promise<RecentVisitRow[]> {
  type VisitPatient = {
    full_name: string | null;
    patient_type: string | null;
  };
  type VisitRow = {
    visit_date: string | null;
    created_by: string | null;
    patient: VisitPatient | null;
  };
  type ProfileRow = { id: string; full_name: string | null };

  const { data: visits, error } = await supabase
    .from('visits')
    .select('visit_date, created_by, patient:patients(full_name, patient_type)')
    .order('visit_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('dashboard recent visits error:', error);
    return [];
  }

  const creatorIds = Array.from(
    new Set(((visits ?? []) as unknown as VisitRow[]).map((v) => v.created_by).filter(Boolean))
  ) as string[];

  const profilesById: Record<string, string> = {};
  if (creatorIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', creatorIds);

    if (profilesError) console.warn('dashboard profiles error:', profilesError);

    ((profiles ?? []) as unknown as ProfileRow[]).forEach((p) => {
      profilesById[p.id] = p.full_name || 'Petugas';
    });
  }

  return ((visits ?? []) as unknown as VisitRow[]).map((v) => {
    const patientType = v.patient?.patient_type || 'balita';
    const badge = TYPE_BADGE[patientType] || {
      label: String(patientType),
      className: 'text-gray-700 bg-gray-50',
    };

    return {
      name: v.patient?.full_name || '-',
      type: badge.label,
      date: v.visit_date ? format(new Date(v.visit_date), 'dd MMM yyyy') : '-',
      officer: v.created_by ? profilesById[v.created_by] || '-' : '-',
      typeColor: badge.className,
    };
  });
}

export async function GET(request: NextRequest) {
  try {
    const rl = await checkRateLimit(request, {
      prefix: 'api_dashboard_get',
      limit: 120,
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

    const sp = request.nextUrl.searchParams;
    const months = clampInt(sp.get('months'), 6, { min: 1, max: 24 });
    const recentLimit = clampInt(sp.get('recentLimit'), 5, { min: 1, max: 20 });

    const supabase = await createServerSupabaseClient();
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id ?? 'anon';

    const cacheKey = `months=${months}:recent=${recentLimit}:user=${userId}`;

    const cached = await cachedJson({
      namespace: 'dashboard',
      key: cacheKey,
      ttlSeconds: 15,
      producer: async () => {
        const [nutrition, trends, recent] = await Promise.all([
          getNutrition(supabase),
          getVisitTrends(supabase, months),
          getRecentVisits(supabase, recentLimit),
        ]);

        const summary = await getSummary(supabase);
        summary.balitaGiziBuruk = nutrition.find((s) => s.status === 'Gizi Buruk')?.count || 0;

        return {
          summary,
          nutrition,
          visitTrends: trends,
          recentVisits: recent,
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
    console.error('Error in GET /api/dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
