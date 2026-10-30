import { CheckInResult } from '@/types/database';
import { aftrStore } from './mock-store';
import { createServerSupabaseClient } from '../supabase/server';

export async function processCheckIn(
  ticketCodeOrHash: string,
  staffId: string,
  eventId: string
): Promise<CheckInResult> {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const { data, error } = await supabase.rpc('check_in_ticket', {
      p_ticket_code_or_hash: ticketCodeOrHash,
      p_staff_id: staffId,
      p_event_id: eventId,
    });

    if (error) {
      return {
        status: 'invalid',
        message: error.message,
      };
    }

    return data as CheckInResult;
  }

  return await aftrStore.checkInTicket(ticketCodeOrHash, staffId, eventId);
}
