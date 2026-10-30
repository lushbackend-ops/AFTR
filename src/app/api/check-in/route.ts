import { NextResponse } from 'next/server';
import { checkInRequestSchema } from '@/lib/validations/booking';
import { processCheckIn } from '@/lib/services/checkin-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = checkInRequestSchema.parse(body);

    const result = await processCheckIn(
      validated.ticket_code,
      validated.staff_id,
      validated.event_id
    );

    // Map business check-in status to HTTP response codes
    if (result.status === 'unauthorised') {
      return NextResponse.json(result, { status: 403 });
    }

    if (result.status === 'invalid') {
      return NextResponse.json(result, { status: 404 });
    }

    if (result.status === 'already_used' || result.status === 'cancelled') {
      return NextResponse.json(result, { status: 409 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Check-in processing error';
    return NextResponse.json({
      status: 'invalid',
      message,
    }, { status: 400 });
  }
}
