-- AFTR Seed Data
-- Demo Organiser, Demo Attendee, 4 Flagship Events, Ticket Types, and Demo Tickets

-- Demo Organiser UUID: 11111111-1111-1111-1111-111111111111
-- Demo Attendee UUID:  22222222-2222-2222-2222-222222222222

INSERT INTO public.profiles (id, email, full_name, role)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'organiser@aftr.events', 'Julian Vance (AFTR Collective)', 'organiser'),
  ('22222222-2222-2222-2222-222222222222', 'attendee@aftr.events', 'Elena Rostova', 'attendee')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

-- Flagship Events
INSERT INTO public.events (id, organiser_id, title, slug, category, description, venue_name, venue_address, city, start_time, end_time, hero_image, capacity, status)
VALUES
(
  'e1111111-1111-1111-1111-111111111111',
  '11111111-1111-1111-1111-111111111111',
  'KRONOS: Nocturnal Cathedral',
  'kronos-nocturnal-cathedral',
  'Electronic & Underground',
  'An uncompromising audiovisual pilgrimage set within a towering deconsecrated industrial turbine hall. Featuring monolithic lighting pillars, spatial quadraphonic soundscapes, and extended sets by premier electronic pioneers.',
  'Kraftwerk Unterground',
  '14 Köpenicker Chaussee',
  'Berlin',
  now() + interval '14 days 4 hours',
  now() + interval '14 days 12 hours',
  '/images/events/techno-warehouse.jpg',
  600,
  'published'
),
(
  'e2222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'ÉCLAT: Haute Couture Showcase 2027',
  'eclat-haute-couture-showcase',
  'Fashion & Runway',
  'Exclusive private runway presentation unveiling seasonal haute couture collections. Staged across black mirrored obsidian runways with bespoke live orchestral accompaniment and champagne reception.',
  'Palais de Cristal',
  '7 Place Vendôme',
  'Paris',
  now() + interval '21 days',
  now() + interval '21 days 5 hours',
  '/images/events/fashion-gala.jpg',
  350,
  'published'
),
(
  'e3333333-3333-3333-3333-333333333333',
  '11111111-1111-1111-1111-111111111111',
  'THE VELVET NOTE: Midnight Jazz & Bourbon',
  'the-velvet-note-midnight-jazz',
  'Jazz & Intimate Salon',
  'A dim-lit salon gathering honoring the masters of hard-bop and contemporary modal jazz. Intimate cabaret seating, rare single-barrel bourbon tastings, and improvised late-night jam sessions.',
  'The St. Regis Speakeasy',
  '2 East 55th Street',
  'New York',
  now() + interval '7 days 2 hours',
  now() + interval '7 days 6 hours',
  '/images/events/jazz-lounge.jpg',
  120,
  'published'
),
(
  'e4444444-4444-4444-4444-444444444444',
  '11111111-1111-1111-1111-111111111111',
  'LUMINA: Sensory Audio-Visual Pavilion',
  'lumina-sensory-pavilion',
  'Digital Art & Immersive',
  'An unprecedented exploration of computational aesthetics, laser topography, and responsive acoustics. Visitors wander freely through large-scale generative geometry and mirror reflections.',
  'Oasis Nexus Pavilion',
  'Harbourfront Arts Precinct',
  'London',
  now() + interval '30 days',
  now() + interval '30 days 8 hours',
  '/images/events/digital-art.jpg',
  800,
  'published'
)
ON CONFLICT (id) DO NOTHING;

-- Ticket Types for KRONOS
INSERT INTO public.ticket_types (id, event_id, name, description, price_cents, total_capacity, remaining_capacity, sale_start, sale_end)
VALUES
  ('t1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'General Admission (Tier 1)', 'Full access to main arena and sound pavilion', 4500, 350, 240, now() - interval '2 days', now() + interval '14 days'),
  ('t1111111-1111-1111-1111-111111111112', 'e1111111-1111-1111-1111-111111111111', 'VIP Mezzanine & Backstage', 'Mezzanine viewing gallery, complimentary craft bar, private coat check', 12000, 150, 85, now() - interval '2 days', now() + interval '14 days'),
  ('t1111111-1111-1111-1111-111111111113', 'e1111111-1111-1111-1111-111111111111', 'All-Access Patron Pass', 'Stage access, soundcheck preview, limited silkscreen print', 25000, 100, 12, now() - interval '2 days', now() + interval '14 days'),

-- Ticket Types for ÉCLAT
  ('t2222222-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'First Row Runway Seat', 'Front-row seat, designer gift presentation, champagne reception', 45000, 80, 14, now() - interval '5 days', now() + interval '21 days'),
  ('t2222222-1111-1111-1111-111111111112', 'e2222222-2222-2222-2222-222222222222', 'Grand Tier Tier Seat', 'Elevated view, official catalogue and salon entry', 22000, 270, 190, now() - interval '5 days', now() + interval '21 days'),

-- Ticket Types for THE VELVET NOTE
  ('t3333333-1111-1111-1111-111111111111', 'e3333333-3333-3333-3333-333333333333', 'Table for Two & Rare Pour', 'Front table, flight of aged bourbon, table service', 18000, 40, 6, now() - interval '1 day', now() + interval '7 days'),
  ('t3333333-1111-1111-1111-111111111112', 'e3333333-3333-3333-3333-333333333333', 'Bar Counter Standing Pass', 'Full salon access and welcome cocktail', 6500, 80, 38, now() - interval '1 day', now() + interval '7 days'),

-- Ticket Types for LUMINA
  ('t4444444-1111-1111-1111-111111111111', 'e4444444-4444-4444-4444-444444444444', 'Timed Entry Pass', 'Full 2-hour experience in interactive light pavilion', 3200, 600, 480, now() - interval '10 days', now() + interval '30 days'),
  ('t4444444-1111-1111-1111-111111111112', 'e4444444-4444-4444-4444-444444444444', 'Immersion Plus & VR Lab', 'Unrestricted entry, catalogue, VR headset experience', 7500, 200, 110, now() - interval '10 days', now() + interval '30 days')
ON CONFLICT (id) DO NOTHING;

-- Seed an Initial Demo Order & Tickets for testing Check-in immediately
INSERT INTO public.orders (id, attendee_id, event_id, total_cents, status, idempotency_key)
VALUES (
  'o1111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'e1111111-1111-1111-1111-111111111111',
  16500,
  'confirmed',
  'demo-seed-order-1'
) ON CONFLICT (id) DO NOTHING;

-- Three demo tickets: 1 VALID, 1 USED (ALREADY CHECKED IN), 1 CANCELLED
INSERT INTO public.tickets (id, order_id, ticket_type_id, event_id, attendee_id, ticket_code, ticket_code_hash, status, checked_in_at, checked_in_by)
VALUES
-- Ticket 1: Ready to scan (VALID)
(
  'tk111111-1111-1111-1111-111111111111',
  'o1111111-1111-1111-1111-111111111111',
  't1111111-1111-1111-1111-111111111112',
  'e1111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'AFTR-DEMO-VAL1-9999',
  encode(digest('AFTR-DEMO-VAL1-9999', 'sha256'), 'hex'),
  'valid',
  NULL,
  NULL
),
-- Ticket 2: Already scanned (USED)
(
  'tk222222-2222-2222-2222-222222222222',
  'o1111111-1111-1111-1111-111111111111',
  't1111111-1111-1111-1111-111111111111',
  'e1111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'AFTR-DEMO-USED-8888',
  encode(digest('AFTR-DEMO-USED-8888', 'sha256'), 'hex'),
  'used',
  now() - interval '45 minutes',
  '11111111-1111-1111-1111-111111111111'
),
-- Ticket 3: Cancelled
(
  'tk333333-3333-3333-3333-333333333333',
  'o1111111-1111-1111-1111-111111111111',
  't1111111-1111-1111-1111-111111111111',
  'e1111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'AFTR-DEMO-CANC-7777',
  encode(digest('AFTR-DEMO-CANC-7777', 'sha256'), 'hex'),
  'cancelled',
  NULL,
  NULL
) ON CONFLICT (id) DO NOTHING;
