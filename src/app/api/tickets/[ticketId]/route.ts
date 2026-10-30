import { NextResponse } from 'next/server';
import { aftrStore } from '@/lib/services/mock-store';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    const { ticketId } = await params;

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('tickets')
        .select('*, ticket_type:ticket_types(*), event:events(*), attendee:profiles(*)')
        .eq('id', ticketId)
        .single();

      if (error) throw error;
      return NextResponse.json({ ticket: data });
    }

    const ticket = aftrStore.getTicketById(ticketId);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch ticket';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
