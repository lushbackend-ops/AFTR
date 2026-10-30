import { NextResponse } from 'next/server';
import { bookingRequestSchema } from '@/lib/validations/booking';
import { processBooking } from '@/lib/services/booking-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = bookingRequestSchema.parse(body);

    const result = await processBooking(validated);

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Booking failed';

    // Distinguish between concurrency capacity exhaustion vs client validation error
    if (message.includes('INSUFFICIENT_CAPACITY')) {
      return NextResponse.json({
        error: message,
        code: 'INSUFFICIENT_CAPACITY',
      }, { status: 409 }); // 409 Conflict
    }

    if (message.includes('INVALID_QUANTITY') || message.includes('EMPTY_ORDER')) {
      return NextResponse.json({
        error: message,
        code: 'VALIDATION_ERROR',
      }, { status: 400 });
    }

    return NextResponse.json({
      error: message,
      code: 'BOOKING_FAILED',
    }, { status: 500 });
  }
}
