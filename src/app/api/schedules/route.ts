import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { bumpCacheVersion, cachedJson, checkRateLimit } from '@/lib/upstash';

// GET /api/schedules - Get all schedules
export async function GET(request: NextRequest) {
  try {
    const rl = await checkRateLimit(request, {
      prefix: 'api_schedules_get',
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

    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const upcoming = searchParams.get('upcoming');
    const limit = searchParams.get('limit');

    const today = new Date().toISOString().split('T')[0];
    const cacheKey = `upcoming=${upcoming === 'true'}:limit=${limit ?? 'none'}:today=${today}`;

    const cached = await cachedJson({
      namespace: 'schedules',
      key: cacheKey,
      ttlSeconds: 60,
      producer: async () => {
        let query = supabase
          .from('schedules')
          .select('*')
          .order('date', { ascending: true });

        // Filter upcoming events
        if (upcoming === 'true') {
          query = query.gte('date', today);
        }

        // Limit results
        if (limit) {
          query = query.limit(parseInt(limit));
        }

        const { data, error } = await query;

        if (error) {
          throw new Error(error.message);
        }

        return { data };
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
    console.error('Error in GET /api/schedules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/schedules - Create new schedule
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    console.log('POST /api/schedules - Received data:', JSON.stringify(body, null, 2));

    const { data, error } = await supabase
      .from('schedules')
      .insert([
        {
          title: body.title,
          subtitle: body.subtitle || null,
          description: body.description || null,
          date: body.date,
          time: body.time || null,
          duration: body.duration || null,
          location: body.location || null,
          full_address: body.full_address || null,
          map_link: body.map_link || null,
          capacity: body.capacity || null,
          price: body.price || 'GRATIS',
          price_note: body.price_note || null,
          coordinator_name: body.coordinator_name || null,
          coordinator_role: body.coordinator_role || null,
          contact_phone: body.contact_phone || null,
          contact_whatsapp: body.contact_whatsapp || null,
          requirements: body.requirements || [],
          important_note_title: body.important_note_title || null,
          important_note_message: body.important_note_message || null,
          tags: body.tags || [],
          created_by: body.created_by || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create schedule', details: error.message, hint: error.hint },
        { status: 500 }
      );
    }

    await bumpCacheVersion('schedules');

    console.log('Successfully created schedule:', data);
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/schedules:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
