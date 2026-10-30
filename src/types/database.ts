export type UserRole = 'attendee' | 'organiser';
export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';
export type OrderStatus = 'confirmed' | 'cancelled' | 'refunded';
export type TicketStatus = 'valid' | 'used' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Event {
  id: string;
  organiser_id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  venue_name: string;
  venue_address: string;
  city: string;
  start_time: string;
  end_time: string;
  hero_image: string;
  capacity: number;
  status: EventStatus;
  created_at: string;
  updated_at: string;
  ticket_types?: TicketType[];
}

export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description: string | null;
  price_cents: number;
  total_capacity: number;
  remaining_capacity: number;
  sale_start: string;
  sale_end: string;
  created_at: string;
}

export interface Order {
  id: string;
  attendee_id: string;
  event_id: string;
  total_cents: number;
  status: OrderStatus;
  idempotency_key?: string | null;
  created_at: string;
  event?: Event;
  tickets?: Ticket[];
}

export interface Ticket {
  id: string;
  order_id: string;
  ticket_type_id: string;
  event_id: string;
  attendee_id: string;
  ticket_code: string;
  ticket_code_hash: string;
  status: TicketStatus;
  checked_in_at: string | null;
  checked_in_by: string | null;
  created_at: string;
  ticket_type?: TicketType;
  event?: Event;
  attendee?: Profile;
}

export interface BookingItem {
  ticket_type_id: string;
  quantity: number;
}

export interface BookingRequest {
  attendee_id: string;
  event_id: string;
  items: BookingItem[];
  idempotency_key?: string;
}

export interface BookingResult {
  success: boolean;
  order_id: string;
  total_cents: number;
  tickets: Array<{
    ticket_code: string;
    ticket_code_hash: string;
    ticket_type_id: string;
  }>;
  is_idempotent_replay?: boolean;
}

export type CheckInStatus = 'valid' | 'already_used' | 'invalid' | 'cancelled' | 'unauthorised';

export interface CheckInResult {
  status: CheckInStatus;
  message: string;
  ticket_id?: string;
  ticket_code?: string;
  attendee_name?: string;
  attendee_email?: string;
  ticket_type?: string;
  checked_in_at?: string;
}

export interface DashboardMetrics {
  totalTicketsSold: number;
  totalCapacity: number;
  remainingCapacity: number;
  bookedValueCents: number;
  checkedInCount: number;
  checkInPercentage: number;
  capacityUtilizationPercentage: number;
  ticketsByType: Array<{
    name: string;
    sold: number;
    total: number;
    remaining: number;
    price_cents: number;
    revenue_cents: number;
  }>;
}

export interface AttendeeExportRow {
  ticket_id: string;
  ticket_code: string;
  attendee_name: string;
  attendee_email: string;
  ticket_type: string;
  order_id: string;
  status: TicketStatus;
  booking_date: string;
  price_paid: string;
  checked_in_at: string;
}
