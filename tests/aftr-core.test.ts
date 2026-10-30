import { describe, it, expect, beforeEach } from 'vitest';
import { aftrStore } from '@/lib/services/mock-store';
import { BookingRequest } from '@/types/database';

describe('AFTR Core Concurrency, Transactional Booking & Security Test Suite', () => {
  beforeEach(() => {
    // Re-seed to guaranteed baseline before each test
    aftrStore.seedInitialData();
  });

  // 1. Successful booking
  it('1. Successfully books tickets atomically and reduces inventory', async () => {
    const eventId = 'e1111111-1111-1111-1111-111111111111';
    const typeId = 't1111111-1111-1111-1111-111111111111';

    const ttBefore = aftrStore.getTicketTypesByEvent(eventId).find((t) => t.id === typeId)!;
    const initialRemaining = ttBefore.remaining_capacity;

    const req: BookingRequest = {
      attendee_id: '22222222-2222-2222-2222-222222222222',
      event_id: eventId,
      items: [{ ticket_type_id: typeId, quantity: 2 }],
      idempotency_key: 'test-idemp-success-1',
    };

    const result = await aftrStore.bookTickets(req);

    expect(result.success).toBe(true);
    expect(result.tickets.length).toBe(2);
    expect(result.total_cents).toBe(ttBefore.price_cents * 2);

    const ttAfter = aftrStore.getTicketTypesByEvent(eventId).find((t) => t.id === typeId)!;
    expect(ttAfter.remaining_capacity).toBe(initialRemaining - 2);
  });

  // 2. Capacity exceeded
  it('2. Rejects booking requests when requested quantity exceeds available capacity', async () => {
    const eventId = 'e1111111-1111-1111-1111-111111111111';
    const typeId = 't1111111-1111-1111-1111-111111111113'; // All-Access has 12 remaining

    const tt = aftrStore.getTicketTypesByEvent(eventId).find((t) => t.id === typeId)!;

    const req: BookingRequest = {
      attendee_id: '22222222-2222-2222-2222-222222222222',
      event_id: eventId,
      items: [{ ticket_type_id: typeId, quantity: tt.remaining_capacity + 1 }],
    };

    await expect(aftrStore.bookTickets(req)).rejects.toThrow(/INSUFFICIENT_CAPACITY/);
  });

  // 3. Concurrent booking of the final ticket (ANTI-OVERSELLING PROOF)
  it('3. Guarantees zero overselling when multiple sessions concurrently contend for the final 1 ticket', async () => {
    // Create an event with a tier having exactly 1 ticket remaining
    const testEvent = aftrStore.createEvent(
      {
        organiser_id: '11111111-1111-1111-1111-111111111111',
        title: 'Concurrent Stress Test Event',
        slug: 'concurrent-stress-test',
        category: 'Electronic & Underground',
        description: 'Testing concurrency under high load',
        venue_name: 'Test Venue',
        venue_address: '123 Test St',
        city: 'Berlin',
        start_time: new Date(Date.now() + 86400000).toISOString(),
        end_time: new Date(Date.now() + 90000000).toISOString(),
        hero_image: '/images/events/techno-warehouse.jpg',
        capacity: 1,
        status: 'published',
      },
      [
        {
          name: 'Final Exclusive Ticket',
          description: null,
          price_cents: 5000,
          total_capacity: 1,
          remaining_capacity: 1, // Only 1 ticket left in the universe!
          sale_start: new Date().toISOString(),
          sale_end: new Date(Date.now() + 86400000).toISOString(),
        },
      ]
    );

    const targetTierId = testEvent.ticket_types![0].id;

    // Launch 10 simultaneous booking attempts racing for the final 1 ticket
    const concurrentAttempts = 10;
    const promises = Array.from({ length: concurrentAttempts }, (_, i) =>
      aftrStore
        .bookTickets({
          attendee_id: '22222222-2222-2222-2222-222222222222',
          event_id: testEvent.id,
          items: [{ ticket_type_id: targetTierId, quantity: 1 }],
          idempotency_key: `race-condition-key-${i}`,
        })
        .then(() => ({ status: 'success' }))
        .catch((err) => ({ status: 'failed', error: err.message }))
    );

    const outcomes = await Promise.all(promises);

    const successes = outcomes.filter((o) => o.status === 'success');
    const failures = outcomes.filter((o) => o.status === 'failed');

    // EXACTLY 1 request must succeed, and 9 must fail
    expect(successes.length).toBe(1);
    expect(failures.length).toBe(9);

    // Remaining capacity must be exactly 0, NEVER negative
    const finalTT = aftrStore.getTicketTypesByEvent(testEvent.id).find((t) => t.id === targetTierId)!;
    expect(finalTT.remaining_capacity).toBe(0);
  });

  // 4. Successful check-in
  it('4. Successfully verifies and checks in a valid ticket at the door', async () => {
    const validCode = 'AFTR-DEMO-VAL1-9999';
    const eventId = 'e1111111-1111-1111-1111-111111111111';
    const organiserId = '11111111-1111-1111-1111-111111111111';

    const result = await aftrStore.checkInTicket(validCode, organiserId, eventId);

    expect(result.status).toBe('valid');
    expect(result.message).toContain('Welcome to AFTR');
    expect(result.attendee_name).toBeDefined();

    // Verify status transitioned to 'used' in store
    const ticket = aftrStore.getTicketsByAttendee('22222222-2222-2222-2222-222222222222').find((t) => t.ticket_code === validCode)!;
    expect(ticket.status).toBe('used');
    expect(ticket.checked_in_at).toBeDefined();
  });

  // 5. Repeated check-in
  it('5. Rejects repeated scans of an already used ticket and returns already_used', async () => {
    const usedCode = 'AFTR-DEMO-USED-8888';
    const eventId = 'e1111111-1111-1111-1111-111111111111';
    const organiserId = '11111111-1111-1111-1111-111111111111';

    const result = await aftrStore.checkInTicket(usedCode, organiserId, eventId);

    expect(result.status).toBe('already_used');
    expect(result.message).toContain('already scanned');
    expect(result.checked_in_at).toBeDefined();
  });

  // 6. Invalid ticket code
  it('6. Rejects unknown or fabricated ticket codes with invalid status', async () => {
    const bogusCode = 'AFTR-FAKE-CODE-0000';
    const eventId = 'e1111111-1111-1111-1111-111111111111';
    const organiserId = '11111111-1111-1111-1111-111111111111';

    const result = await aftrStore.checkInTicket(bogusCode, organiserId, eventId);

    expect(result.status).toBe('invalid');
  });

  // 7. Cancelled ticket
  it('7. Rejects check-in for cancelled tickets with cancelled status', async () => {
    const cancelledCode = 'AFTR-DEMO-CANC-7777';
    const eventId = 'e1111111-1111-1111-1111-111111111111';
    const organiserId = '11111111-1111-1111-1111-111111111111';

    const result = await aftrStore.checkInTicket(cancelledCode, organiserId, eventId);

    expect(result.status).toBe('cancelled');
    expect(result.message).toContain('cancelled');
  });

  // 8. Attendee attempting organiser access
  it('8. Rejects attendee attempting organiser dashboard access', async () => {
    const eventId = 'e1111111-1111-1111-1111-111111111111';
    const attendeeId = '22222222-2222-2222-2222-222222222222'; // Attendee, not organiser

    expect(() => aftrStore.getDashboardMetrics(eventId, attendeeId)).toThrow(/Unauthorised/);
  });

  // 9. Organiser accessing another organiser's event
  it("9. Rejects organiser scanning or accessing another organiser's event", async () => {
    const eventId = 'e1111111-1111-1111-1111-111111111111';
    const rogueOrganiserId = '99999999-9999-9999-9999-999999999999';

    const result = await aftrStore.checkInTicket('AFTR-DEMO-VAL1-9999', rogueOrganiserId, eventId);
    expect(result.status).toBe('unauthorised');
  });

  // 10. Invalid ticket quantity
  it('10. Rejects zero or negative ticket quantities and empty bookings', async () => {
    const eventId = 'e1111111-1111-1111-1111-111111111111';
    const typeId = 't1111111-1111-1111-1111-111111111111';

    // Zero quantity
    await expect(
      aftrStore.bookTickets({
        attendee_id: '22222222-2222-2222-2222-222222222222',
        event_id: eventId,
        items: [{ ticket_type_id: typeId, quantity: 0 }],
      })
    ).rejects.toThrow(/INVALID_QUANTITY/);

    // Empty items
    await expect(
      aftrStore.bookTickets({
        attendee_id: '22222222-2222-2222-2222-222222222222',
        event_id: eventId,
        items: [],
      })
    ).rejects.toThrow(/EMPTY_ORDER/);
  });
});
