import { BookingRequest, BookingResult } from '@/types/database';
import { aftrStore } from './mock-store';
import { createServerSupabaseClient } from '../supabase/server';

export async function processBooking(req: BookingRequest): Promise<BookingResult> {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    // Call PostgreSQL transactional stored procedure book_tickets
    const { data, error } = await supabase.rpc('book_tickets', {
      p_attendee_id: req.attendee_id,
      p_event_id: req.event_id,
      p_items: req.items,
      p_idempotency_key: req.idempotency_key || null,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data as BookingResult;
  }

  // Fallback to local high-performance transactional mock store with simulated row locks
  return await aftrStore.bookTickets(req);
}
