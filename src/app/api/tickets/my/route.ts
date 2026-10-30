import { NextResponse } from 'next/server';
import { aftrStore } from '@/lib/services/mock-store';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const attendeeId = searchParams.get('attendee_id') || '22222222-2222-2222-2222-222222222222';

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, ticket_type:ticket_types(*), event:events(*)')
        .eq('attendee_id', attendeeId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json({ tickets: data });
    }

    const tickets = aftrStore.getTicketsByAttendee(attendeeId);
    return NextResponse.json({ tickets });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tickets';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
