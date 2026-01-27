import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

// GET /api/schedules - Get all schedules
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const searchParams = request.nextUrl.searchParams;
    const upcoming = searchParams.get('upcoming');
    const limit = searchParams.get('limit');

    let query = supabase
      .from('schedules')
      .select('*')
      .order('date', { ascending: true });

    // Filter upcoming events
    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('date', today);
    }

    // Limit results
    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch schedules', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
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
