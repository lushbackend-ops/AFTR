import { NextResponse } from 'next/server';
import { aftrStore } from '@/lib/services/mock-store';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createEventSchema } from '@/lib/validations/booking';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organiserId = searchParams.get('organiser_id');

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      let query = supabase.from('events').select('*, ticket_types(*)');
      if (organiserId) {
        query = query.eq('organiser_id', organiserId);
      } else {
        query = query.eq('status', 'published');
      }
      const { data, error } = await query.order('start_time', { ascending: true });
      if (error) throw error;
      return NextResponse.json({ events: data });
    }

    if (organiserId) {
      const events = aftrStore.getOrganiserEvents(organiserId);
      return NextResponse.json({ events });
    }

    const events = aftrStore.getEvents();
    return NextResponse.json({ events });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch events';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = createEventSchema.parse(body);

    const organiserId = body.organiser_id || '11111111-1111-1111-1111-111111111111';

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data: eventData, error: eventErr } = await supabase
        .from('events')
        .insert({
          organiser_id: organiserId,
          title: validated.title,
          slug: validated.slug,
          category: validated.category,
          description: validated.description,
          venue_name: validated.venue_name,
          venue_address: validated.venue_address,
          city: validated.city,
          start_time: validated.start_time,
          end_time: validated.end_time,
          hero_image: validated.hero_image,
          capacity: validated.capacity,
          status: 'published',
        })
        .select()
        .single();

      if (eventErr) throw eventErr;

      const ticketTypesToInsert = validated.ticket_types.map((tt) => ({
        event_id: eventData.id,
        name: tt.name,
        description: tt.description || null,
        price_cents: tt.price_cents,
        total_capacity: tt.total_capacity,
        remaining_capacity: tt.total_capacity,
        sale_start: tt.sale_start,
        sale_end: tt.sale_end,
      }));

      const { data: ttData, error: ttErr } = await supabase
        .from('ticket_types')
        .insert(ticketTypesToInsert)
        .select();

      if (ttErr) throw ttErr;

      return NextResponse.json({
        event: {
          ...eventData,
          ticket_types: ttData,
        },
      }, { status: 201 });
    }

    const event = aftrStore.createEvent(
      {
        organiser_id: organiserId,
        title: validated.title,
        slug: validated.slug,
        category: validated.category,
        description: validated.description,
        venue_name: validated.venue_name,
        venue_address: validated.venue_address,
        city: validated.city,
        start_time: validated.start_time,
        end_time: validated.end_time,
        hero_image: validated.hero_image,
        capacity: validated.capacity,
        status: 'published',
      },
      validated.ticket_types.map((tt) => ({
        name: tt.name,
        description: tt.description || null,
        price_cents: tt.price_cents,
        total_capacity: tt.total_capacity,
        remaining_capacity: tt.total_capacity,
        sale_start: tt.sale_start,
        sale_end: tt.sale_end,
      }))
    );

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create event';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
