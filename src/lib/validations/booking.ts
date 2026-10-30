import { z } from 'zod';

export const bookingItemSchema = z.object({
  ticket_type_id: z.string().min(8, { message: 'Invalid ticket type ID format' }),
  quantity: z.number().int().min(1, { message: 'Quantity must be at least 1' }).max(10, { message: 'Max 10 tickets per order' }),
});

export const bookingRequestSchema = z.object({
  attendee_id: z.string().min(8, { message: 'Invalid attendee ID format' }),
  event_id: z.string().min(8, { message: 'Invalid event ID format' }),
  items: z.array(bookingItemSchema).min(1, { message: 'Order must contain at least one ticket' }),
  idempotency_key: z.string().min(8).max(128).optional(),
});

export const checkInRequestSchema = z.object({
  ticket_code: z.string().min(5, { message: 'Ticket code must be provided' }),
  event_id: z.string().min(8, { message: 'Valid event ID required' }),
  staff_id: z.string().min(8, { message: 'Valid staff member ID required' }),
});

export const createEventSchema = z.object({
  title: z.string().min(3).max(120),
  slug: z.string().min(3).max(120).regex(/^[a-z0-9-]+$/, { message: 'Slug can only contain lowercase letters, numbers, and hyphens' }),
  category: z.string().min(2).max(50),
  description: z.string().min(10).max(2000),
  venue_name: z.string().min(2).max(100),
  venue_address: z.string().min(5).max(200),
  city: z.string().min(2).max(50),
  start_time: z.string().datetime(),
  end_time: z.string().datetime(),
  hero_image: z.string().min(1),
  capacity: z.number().int().min(1),
  ticket_types: z.array(
    z.object({
      name: z.string().min(2).max(80),
      description: z.string().max(250).optional(),
      price_cents: z.number().int().min(0),
      total_capacity: z.number().int().min(1),
      sale_start: z.string().datetime(),
      sale_end: z.string().datetime(),
    })
  ).min(1, { message: 'At least one ticket tier must be configured' }),
});
