import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { bumpCacheVersion, cachedJson, checkRateLimit } from '@/lib/upstash';

// GET /api/schedules/[id] - Get single schedule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rl = await checkRateLimit(request, {
      prefix: 'api_schedules_id_get',
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

    const { id } = await params;
    const supabase = createClient();

    const cached = await cachedJson({
      namespace: 'schedules',
      key: `id:${id}`,
      ttlSeconds: 120,
      producer: async () => {
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .eq('id', id)
          .single();

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
    console.error('Error in GET /api/schedules/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/schedules/[id] - Update schedule
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('schedules')
      .update({
        title: body.title,
        subtitle: body.subtitle,
        description: body.description,
        date: body.date,
        time: body.time,
        duration: body.duration,
        location: body.location,
        full_address: body.full_address,
        map_link: body.map_link,
        capacity: body.capacity,
        price: body.price,
        price_note: body.price_note,
        coordinator_name: body.coordinator_name,
        coordinator_role: body.coordinator_role,
        contact_phone: body.contact_phone,
        contact_whatsapp: body.contact_whatsapp,
        requirements: body.requirements,
        important_note_title: body.important_note_title,
        important_note_message: body.important_note_message,
        tags: body.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update schedule', details: error.message },
        { status: 500 }
      );
    }

    await bumpCacheVersion('schedules');

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in PUT /api/schedules/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/schedules/[id] - Delete schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient();

    const { error } = await supabase
      .from('schedules')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete schedule', details: error.message },
        { status: 500 }
      );
    }

    await bumpCacheVersion('schedules');

    return NextResponse.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/schedules/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
