import { NextResponse } from 'next/server';
import { aftrStore } from '@/lib/services/mock-store';

function sanitizeCSVField(val: unknown): string {
  if (val === null || val === undefined) return '""';
  let str = String(val).trim();

  // Mitigate Spreadsheet Formula Injection (CWE-1236)
  // If field starts with =, +, -, @, \t, \r, prepend a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes by doubling them
  str = str.replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const organiserId = searchParams.get('organiser_id') || '11111111-1111-1111-1111-111111111111';

    if (!eventId) {
      return NextResponse.json({ error: 'event_id parameter is required' }, { status: 400 });
    }

    const event = aftrStore.getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    const rows = aftrStore.getAttendeeExportRows(eventId, event.organiser_id);

    const headers = [
      'Ticket ID',
      'Ticket Code',
      'Attendee Name',
      'Attendee Email',
      'Ticket Tier',
      'Order ID',
      'Ticket Status',
      'Booking Date',
      'Price Paid (INR)',
      'Checked-In Timestamp',
    ];

    const csvLines = [
      headers.map(sanitizeCSVField).join(','),
      ...rows.map((r) =>
        [
          r.ticket_id,
          r.ticket_code,
          r.attendee_name,
          r.attendee_email,
          r.ticket_type,
          r.order_id,
          r.status,
          r.booking_date,
          r.price_paid,
          r.checked_in_at,
        ]
          .map(sanitizeCSVField)
          .join(',')
      ),
    ];

    const csvContent = csvLines.join('\r\n');
    const filename = `aftr-${event.slug}-attendees-${new Date().toISOString().slice(0, 10)}.csv`;

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'CSV generation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
