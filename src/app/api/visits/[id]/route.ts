import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { cachedJson, checkRateLimit } from '@/lib/upstash';

// GET /api/visits/:id
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const rl = await checkRateLimit(request, {
      prefix: 'api_visits_id_get',
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

    const { id } = await context.params;
    const supabase = createClient();

    const cached = await cachedJson({
      namespace: 'visits',
      key: `id=${id}`,
      ttlSeconds: 60,
      producer: async () => {
        const { data: visit, error: visitError } = await supabase
          .from('visits')
          .select(
            `
            *,
            patient:patients(*)
          `
          )
          .eq('id', id)
          .single();

        if (visitError) throw new Error(visitError.message);

        const createdBy = (visit as { created_by?: string | null }).created_by ?? null;
        const { data: profile, error: profileError } = createdBy
          ? await supabase.from('profiles').select('*').eq('id', createdBy).maybeSingle()
          : { data: null, error: null };

        if (profileError) throw new Error(profileError.message);

        return {
          data: {
            ...visit,
            profile: profile ?? null,
          },
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
    console.error('Error in GET /api/visits/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
