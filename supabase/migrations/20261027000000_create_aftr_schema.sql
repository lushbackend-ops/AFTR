-- AFTR Event Ticketing Platform Schema
-- Robust, Transactional, Concurrency-Safe PostgreSQL with RLS

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table extending Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('attendee', 'organiser')) DEFAULT 'attendee',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT NOT NULL,
  city TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  hero_image TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'cancelled', 'completed')) DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ticket Types table
CREATE TABLE IF NOT EXISTS public.ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
  remaining_capacity INTEGER NOT NULL CHECK (remaining_capacity >= 0 AND remaining_capacity <= total_capacity),
  sale_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  sale_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled', 'refunded')) DEFAULT 'confirmed',
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES public.ticket_types(id) ON DELETE RESTRICT,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  attendee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  ticket_code TEXT NOT NULL UNIQUE,
  ticket_code_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('valid', 'used', 'cancelled')) DEFAULT 'valid',
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_events_organiser ON public.events(organiser_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_ticket_types_event ON public.ticket_types(event_id);
CREATE INDEX IF NOT EXISTS idx_orders_attendee ON public.orders(attendee_id);
CREATE INDEX IF NOT EXISTS idx_orders_event ON public.orders(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_order ON public.tickets(order_id);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON public.tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_attendee ON public.tickets(attendee_id);
CREATE INDEX IF NOT EXISTS idx_tickets_hash ON public.tickets(ticket_code_hash);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Events Policies
CREATE POLICY "Published events are viewable by everyone" 
  ON public.events FOR SELECT USING (status = 'published' OR auth.uid() = organiser_id);

CREATE POLICY "Organisers can insert their own events" 
  ON public.events FOR INSERT WITH CHECK (auth.uid() = organiser_id);

CREATE POLICY "Organisers can update their own events" 
  ON public.events FOR UPDATE USING (auth.uid() = organiser_id);

CREATE POLICY "Organisers can delete their own events" 
  ON public.events FOR DELETE USING (auth.uid() = organiser_id);

-- Ticket Types Policies
CREATE POLICY "Ticket types are viewable if event is viewable" 
  ON public.ticket_types FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events WHERE events.id = ticket_types.event_id AND (events.status = 'published' OR events.organiser_id = auth.uid()))
  );

CREATE POLICY "Organisers can manage ticket types for their events" 
  ON public.ticket_types FOR ALL USING (
    EXISTS (SELECT 1 FROM public.events WHERE events.id = ticket_types.event_id AND events.organiser_id = auth.uid())
  );

-- Orders Policies
CREATE POLICY "Attendees can view their own orders" 
  ON public.orders FOR SELECT USING (auth.uid() = attendee_id);

CREATE POLICY "Organisers can view orders for their events" 
  ON public.orders FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.events WHERE events.id = orders.event_id AND events.organiser_id = auth.uid())
  );

-- Tickets Policies
CREATE POLICY "Attendees can view their own tickets" 
  ON public.tickets FOR SELECT USING (auth.uid() = attendee_id);

CREATE POLICY "Organisers can view and manage tickets for their events" 
  ON public.tickets FOR ALL USING (
    EXISTS (SELECT 1 FROM public.events WHERE events.id = tickets.event_id AND events.organiser_id = auth.uid())
  );

-- Function: Transactional Booking Without Overselling
-- Locks ticket types in deterministic ascending order to prevent deadlocks
-- Checks remaining capacity, updates capacity, creates order and tickets atomically
CREATE OR REPLACE FUNCTION public.book_tickets(
  p_attendee_id UUID,
  p_event_id UUID,
  p_items JSONB,
  p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_item RECORD;
  v_type RECORD;
  v_order_id UUID;
  v_total_cents INTEGER := 0;
  v_type_ids UUID[];
  v_ticket_code TEXT;
  v_code_hash TEXT;
  v_tickets_created JSONB := '[]'::jsonb;
  v_existing_order_id UUID;
  v_event_status TEXT;
  i INTEGER;
BEGIN
  -- Check idempotency
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_order_id FROM public.orders WHERE idempotency_key = p_idempotency_key;
    IF v_existing_order_id IS NOT NULL THEN
      RETURN jsonb_build_object(
        'success', true,
        'order_id', v_existing_order_id,
        'is_idempotent_replay', true
      );
    END IF;
  END IF;

  -- Verify event exists and is published
  SELECT status INTO v_event_status FROM public.events WHERE id = p_event_id;
  IF v_event_status IS NULL THEN
    RAISE EXCEPTION 'EVENT_NOT_FOUND: Specified event does not exist';
  END IF;
  IF v_event_status != 'published' THEN
    RAISE EXCEPTION 'EVENT_NOT_AVAILABLE: Event is not open for ticket sales';
  END IF;

  -- Collect ticket type IDs for deterministic sorted locking
  SELECT ARRAY_AGG((item->>'ticket_type_id')::UUID ORDER BY (item->>'ticket_type_id')::UUID)
  INTO v_type_ids
  FROM jsonb_array_elements(p_items) AS item;

  IF array_length(v_type_ids, 1) IS NULL OR array_length(v_type_ids, 1) = 0 THEN
    RAISE EXCEPTION 'EMPTY_ORDER: No tickets specified in order request';
  END IF;

  -- Lock ticket types in deterministic order (prevents deadlocks under high concurrency)
  PERFORM id
  FROM public.ticket_types
  WHERE id = ANY(v_type_ids) AND event_id = p_event_id
  ORDER BY id
  FOR UPDATE;

  -- Calculate totals and verify inventory
  FOR v_item IN SELECT (value->>'ticket_type_id')::UUID AS type_id, (value->>'quantity')::INTEGER AS qty
                FROM jsonb_array_elements(p_items)
  LOOP
    IF v_item.qty <= 0 THEN
      RAISE EXCEPTION 'INVALID_QUANTITY: Requested quantity must be greater than zero';
    END IF;

    SELECT id, name, price_cents, remaining_capacity
    INTO v_type
    FROM public.ticket_types
    WHERE id = v_item.type_id AND event_id = p_event_id;

    IF v_type.id IS NULL THEN
      RAISE EXCEPTION 'INVALID_TICKET_TYPE: Ticket type % not found for this event', v_item.type_id;
    END IF;

    IF v_type.remaining_capacity < v_item.qty THEN
      RAISE EXCEPTION 'INSUFFICIENT_CAPACITY: Only % tickets remaining for %', v_type.remaining_capacity, v_type.name;
    END IF;

    -- Deduct remaining capacity
    UPDATE public.ticket_types
    SET remaining_capacity = remaining_capacity - v_item.qty
    WHERE id = v_item.type_id;

    v_total_cents := v_total_cents + (v_type.price_cents * v_item.qty);
  END LOOP;

  -- Insert order
  INSERT INTO public.orders (attendee_id, event_id, total_cents, status, idempotency_key)
  VALUES (p_attendee_id, p_event_id, v_total_cents, 'confirmed', p_idempotency_key)
  RETURNING id INTO v_order_id;

  -- Generate unpredictable cryptographic ticket codes and insert tickets
  FOR v_item IN SELECT (value->>'ticket_type_id')::UUID AS type_id, (value->>'quantity')::INTEGER AS qty
                FROM jsonb_array_elements(p_items)
  LOOP
    FOR i IN 1..v_item.qty LOOP
      -- Generate cryptographically random code: e.g. AFTR-4B8F-9C12-E57A
      v_ticket_code := 'AFTR-' || UPPER(SUBSTRING(encode(gen_random_bytes(6), 'hex') FROM 1 FOR 4)) || '-' ||
                                 UPPER(SUBSTRING(encode(gen_random_bytes(6), 'hex') FROM 5 FOR 4)) || '-' ||
                                 UPPER(SUBSTRING(encode(gen_random_bytes(6), 'hex') FROM 9 FOR 4));
      
      -- SHA-256 hash stored for secure lookups and scanner verification
      v_code_hash := encode(digest(v_ticket_code, 'sha256'), 'hex');

      INSERT INTO public.tickets (
        order_id, ticket_type_id, event_id, attendee_id,
        ticket_code, ticket_code_hash, status
      )
      VALUES (
        v_order_id, v_item.type_id, p_event_id, p_attendee_id,
        v_ticket_code, v_code_hash, 'valid'
      );

      v_tickets_created := v_tickets_created || jsonb_build_object(
        'ticket_code', v_ticket_code,
        'ticket_code_hash', v_code_hash,
        'ticket_type_id', v_item.type_id
      );
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', v_order_id,
    'total_cents', v_total_cents,
    'tickets', v_tickets_created
  );
END;
$$;

-- Function: Atomic Check-in Scanner Verification
CREATE OR REPLACE FUNCTION public.check_in_ticket(
  p_ticket_code_or_hash TEXT,
  p_staff_id UUID,
  p_event_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ticket RECORD;
  v_input_hash TEXT;
  v_attendee_name TEXT;
  v_ticket_type_name TEXT;
  v_is_organiser BOOLEAN;
BEGIN
  -- Verify staff authorization for this event
  SELECT EXISTS (
    SELECT 1 FROM public.events WHERE id = p_event_id AND organiser_id = p_staff_id
  ) INTO v_is_organiser;

  IF NOT v_is_organiser THEN
    RETURN jsonb_build_object(
      'status', 'unauthorised',
      'message', 'Staff member is not authorized to scan tickets for this event'
    );
  END IF;

  -- Determine if input is already a 64-char sha256 hash or plaintext code
  IF LENGTH(p_ticket_code_or_hash) = 64 THEN
    v_input_hash := LOWER(p_ticket_code_or_hash);
  ELSE
    v_input_hash := encode(digest(TRIM(p_ticket_code_or_hash), 'sha256'), 'hex');
  END IF;

  -- Lock ticket row
  SELECT t.*, p.full_name AS attendee_name, p.email AS attendee_email, tt.name AS type_name
  INTO v_ticket
  FROM public.tickets t
  JOIN public.profiles p ON p.id = t.attendee_id
  JOIN public.ticket_types tt ON tt.id = t.ticket_type_id
  WHERE t.ticket_code_hash = v_input_hash OR t.ticket_code = TRIM(p_ticket_code_or_hash)
  FOR UPDATE OF t;

  IF v_ticket.id IS NULL THEN
    RETURN jsonb_build_object(
      'status', 'invalid',
      'message', 'Ticket code not found or unrecognized'
    );
  END IF;

  IF v_ticket.event_id != p_event_id THEN
    RETURN jsonb_build_object(
      'status', 'unauthorised',
      'message', 'This ticket was issued for a different event'
    );
  END IF;

  IF v_ticket.status = 'cancelled' THEN
    RETURN jsonb_build_object(
      'status', 'cancelled',
      'message', 'This ticket has been cancelled and cannot be used',
      'ticket_id', v_ticket.id,
      'attendee_name', v_ticket.attendee_name,
      'ticket_type', v_ticket.type_name
    );
  END IF;

  IF v_ticket.status = 'used' THEN
    RETURN jsonb_build_object(
      'status', 'already_used',
      'message', 'Ticket was already scanned and checked in',
      'ticket_id', v_ticket.id,
      'attendee_name', v_ticket.attendee_name,
      'ticket_type', v_ticket.type_name,
      'checked_in_at', v_ticket.checked_in_at
    );
  END IF;

  -- Valid ticket: transition to 'used' atomically
  UPDATE public.tickets
  SET status = 'used',
      checked_in_at = now(),
      checked_in_by = p_staff_id
  WHERE id = v_ticket.id;

  RETURN jsonb_build_object(
    'status', 'valid',
    'message', 'Check-in confirmed. Welcome!',
    'ticket_id', v_ticket.id,
    'ticket_code', v_ticket.ticket_code,
    'attendee_name', v_ticket.attendee_name,
    'attendee_email', v_ticket.attendee_email,
    'ticket_type', v_ticket.type_name,
    'checked_in_at', now()
  );
END;
$$;
