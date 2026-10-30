import { NextResponse } from 'next/server';
import { aftrStore } from '@/lib/services/mock-store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const organiserId = searchParams.get('organiser_id') || '11111111-1111-1111-1111-111111111111';

    if (!eventId) {
      // If no specific event is chosen, return the organiser's first event or overview
      const organiserEvents = aftrStore.getOrganiserEvents(organiserId);
      if (organiserEvents.length === 0) {
        return NextResponse.json({ error: 'No events found for this organiser' }, { status: 404 });
      }
      const defaultEvent = organiserEvents[0];
      const metrics = aftrStore.getDashboardMetrics(defaultEvent.id, organiserId);
      return NextResponse.json({
        event: defaultEvent,
        events: organiserEvents,
        metrics,
      });
    }

    let targetEvent = aftrStore.getEventById(eventId);
    if (!targetEvent) {
      const all = aftrStore.getEvents();
      if (all.length > 0) {
        targetEvent = all[0];
      } else {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }
    }

    const organiserEvents = aftrStore.getOrganiserEvents(organiserId);
    const availableEvents = organiserEvents.length > 0 ? organiserEvents : aftrStore.getEvents();

    const metrics = aftrStore.getDashboardMetrics(targetEvent.id, targetEvent.organiser_id);
    const attendees = aftrStore.getAttendeeExportRows(targetEvent.id, targetEvent.organiser_id);

    return NextResponse.json({
      event: targetEvent,
      events: availableEvents,
      metrics,
      attendees,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to retrieve dashboard metrics';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
