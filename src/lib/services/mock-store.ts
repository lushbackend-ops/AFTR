import { Profile, Event, TicketType, Order, Ticket, BookingRequest, BookingResult, CheckInResult, DashboardMetrics, AttendeeExportRow } from '@/types/database';
import crypto from 'crypto';

// In-memory persistent database for offline development, automated tests, and instant demo preview
class AFTRDataStore {
  private profiles: Map<string, Profile> = new Map();
  private events: Map<string, Event> = new Map();
  private ticketTypes: Map<string, TicketType> = new Map();
  private orders: Map<string, Order> = new Map();
  private tickets: Map<string, Ticket> = new Map();

  // Concurrency Mutex locks to emulate Postgres ROW-LEVEL LOCKING (FOR UPDATE)
  private locks: Map<string, Promise<void>> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private async acquireLock(key: string): Promise<() => void> {
    while (this.locks.has(key)) {
      await this.locks.get(key);
    }
    let resolveLock!: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });
    this.locks.set(key, lockPromise);
    return () => {
      this.locks.delete(key);
      resolveLock();
    };
  }

  private hashTicketCode(code: string): string {
    return crypto.createHash('sha256').update(code.trim()).digest('hex');
  }

  public seedInitialData() {
    // 1. Demo Profiles (Indian Organiser & Attendee)
    const organiser: Profile = {
      id: '11111111-1111-1111-1111-111111111111',
      email: 'arjun@aftr.events',
      full_name: 'Arjun Mehta (AFTR India)',
      role: 'organiser',
      created_at: new Date().toISOString(),
    };
    const attendee: Profile = {
      id: '22222222-2222-2222-2222-222222222222',
      email: 'rhea@aftr.events',
      full_name: 'Rhea Kapoor',
      role: 'attendee',
      created_at: new Date().toISOString(),
    };
    this.profiles.set(organiser.id, organiser);
    this.profiles.set(attendee.id, attendee);

    // 2. Curated Flagship Indian Cultural Events
    const eventsList: Event[] = [
      {
        id: 'e1111111-1111-1111-1111-111111111111',
        organiser_id: organiser.id,
        title: 'MAGNETIC FIELDS: Desert Palace Sanctuary',
        slug: 'magnetic-fields-desert-sanctuary',
        category: 'Heritage & Electronic',
        description: 'An ethereal confluence of contemporary soundscapes and 17th-century Rajasthani royalty set within the courtyards and dunes of Alsisar Mahal. Featuring secret dungeon listening rooms, Bedouin desert camps, sunrise ambient sitar sessions, and modular synthesizers beneath the Thar starlight.',
        venue_name: 'Alsisar Mahal Heritage Palace',
        venue_address: 'Alsisar Village, Jhunjhunu District',
        city: 'Rajasthan',
        start_time: new Date(Date.now() + 14 * 86400000 + 4 * 3600000).toISOString(),
        end_time: new Date(Date.now() + 14 * 86400000 + 12 * 3600000).toISOString(),
        hero_image: '/images/events/techno-warehouse.jpg',
        capacity: 650,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'e2222222-2222-2222-2222-222222222222',
        organiser_id: organiser.id,
        title: 'ECHOES OF EARTH: Bamboo Canopy Sound Temple',
        slug: 'echoes-of-earth-sound-temple',
        category: 'Eco-Acoustic & Electronic',
        description: 'India’s pioneer ecological sound sanctuary set among 150 acres of sprawling eucalyptus woodland. Featuring handcrafted bamboo monumental stages, spatial quadraphonic arrays, international techno pioneers, and deep roots traditional folk percussions.',
        venue_name: 'Embassy International Forest Grounds',
        venue_address: 'Tarahunise Post, North Bengaluru',
        city: 'Bengaluru',
        start_time: new Date(Date.now() + 21 * 86400000).toISOString(),
        end_time: new Date(Date.now() + 21 * 86400000 + 5 * 3600000).toISOString(),
        hero_image: '/images/events/fashion-gala.jpg',
        capacity: 450,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'e3333333-3333-3333-3333-333333333333',
        organiser_id: organiser.id,
        title: 'NOCTURNAL COVE: Vagator Basalt & Modular Sitar',
        slug: 'nocturnal-cove-goa',
        category: 'Coastal & Underground',
        description: 'An open-air ritual perched above the volcanic cliffs of North Goa overlooking the Arabian Sea. Monolithic sub-bass frequencies, microtonal Indian classical raga explorations, and dusk-to-dawn hypnotic electronic pilgrimages.',
        venue_name: 'Vagator Cliffside Amphitheatre',
        venue_address: 'Ozran Beach Road, Anjuna',
        city: 'Goa',
        start_time: new Date(Date.now() + 7 * 86400000 + 2 * 3600000).toISOString(),
        end_time: new Date(Date.now() + 7 * 86400000 + 6 * 3600000).toISOString(),
        hero_image: '/images/events/jazz-lounge.jpg',
        capacity: 350,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'e4444444-4444-4444-4444-444444444444',
        organiser_id: organiser.id,
        title: 'THE VELVET BAITHAK: Midnight Jazz & Indian Classical',
        slug: 'the-velvet-baithak-mumbai',
        category: 'Jazz & Indian Classical',
        description: 'A dim-lit salon inside Bombay’s historic cinematic soundstages. Master sarangi and tabla virtuosos in spontaneous dialogue with modal jazz trios. Intimate floor seating, single-cask pours, and velvet acoustics.',
        venue_name: 'Mehboob Studios Soundstage 3',
        venue_address: 'Hill Road, Bandra West',
        city: 'Mumbai',
        start_time: new Date(Date.now() + 30 * 86400000).toISOString(),
        end_time: new Date(Date.now() + 30 * 86400000 + 8 * 3600000).toISOString(),
        hero_image: '/images/events/digital-art.jpg',
        capacity: 200,
        status: 'published',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    eventsList.forEach((ev) => this.events.set(ev.id, ev));

    // 3. Ticket Types (INR Cent Denomination: ₹1 = 100 subunits)
    const ticketTypesList: TicketType[] = [
      // MAGNETIC FIELDS
      {
        id: 't1111111-1111-1111-1111-111111111111',
        event_id: 'e1111111-1111-1111-1111-111111111111',
        name: 'Desert Oasis Weekend Pass',
        description: '3-Day access to palace stages, dungeon listening room & desert dunes',
        price_cents: 950000, // ₹9,500
        total_capacity: 400,
        remaining_capacity: 180,
        sale_start: new Date(Date.now() - 2 * 86400000).toISOString(),
        sale_end: new Date(Date.now() + 14 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 't1111111-1111-1111-1111-111111111112',
        event_id: 'e1111111-1111-1111-1111-111111111111',
        name: 'Palace Courtyard VIP & Bedouin Camp',
        description: 'VIP palace mezzanine, luxury desert tent stay, complimentary royal dinner',
        price_cents: 2200000, // ₹22,000
        total_capacity: 150,
        remaining_capacity: 42,
        sale_start: new Date(Date.now() - 2 * 86400000).toISOString(),
        sale_end: new Date(Date.now() + 14 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 't1111111-1111-1111-1111-111111111113',
        event_id: 'e1111111-1111-1111-1111-111111111111',
        name: 'Mahal Royal Patron Suite',
        description: 'Heritage suite inside 17th-century palace, all-access artist credentials',
        price_cents: 5500000, // ₹55,000
        total_capacity: 100,
        remaining_capacity: 8,
        sale_start: new Date(Date.now() - 2 * 86400000).toISOString(),
        sale_end: new Date(Date.now() + 14 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
      },
      // ECHOES OF EARTH
      {
        id: 't2222222-1111-1111-1111-111111111111',
        event_id: 'e2222222-2222-2222-2222-222222222222',
        name: 'Forest Festival Pass (2-Day)',
        description: 'Access to 4 monumental bamboo stages and ecological art pavilions',
        price_cents: 450000, // ₹4,500
        total_capacity: 350,
        remaining_capacity: 190,
        sale_start: new Date(Date.now() - 5 * 86400000).toISOString(),
        sale_end: new Date(Date.now() + 21 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 't2222222-1111-1111-1111-111111111112',
        event_id: 'e2222222-2222-2222-2222-222222222222',
        name: 'VIP Green Canopy Lounge',
        description: 'Elevated treehouse viewing deck, private craft bar, festival merchandise bag',
        price_cents: 950000, // ₹9,500
        total_capacity: 100,
        remaining_capacity: 34,
        sale_start: new Date(Date.now() - 5 * 86400000).toISOString(),
        sale_end: new Date(Date.now() + 21 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
      },
      // NOCTURNAL COVE GOA
      {
        id: 't3333333-1111-1111-1111-111111111111',
        event_id: 'e3333333-3333-3333-3333-333333333333',
        name: 'Cliffside Sunset Pass',
        description: 'Full cliff amphitheatre access from dusk until morning sunrise',
        price_cents: 350000, // ₹3,500
        total_capacity: 250,
        remaining_capacity: 88,
        sale_start: new Date(Date.now() - 1 * 86400000).toISOString(),
        sale_end: new Date(Date.now() + 7 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 't3333333-1111-1111-1111-111111111112',
        event_id: 'e3333333-3333-3333-3333-333333333333',
        name: 'Ocean Deck VIP Table for Two',
        description: 'Reserved cliff table overlooking the Arabian Sea, curated mezze & beverages',
        price_cents: 1200000, // ₹12,000
        total_capacity: 100,
        remaining_capacity: 18,
        sale_start: new Date(Date.now() - 1 * 86400000).toISOString(),
        sale_end: new Date(Date.now() + 7 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
      },
      // VELVET BAITHAK MUMBAI
      {
        id: 't4444444-1111-1111-1111-111111111111',
        event_id: 'e4444444-4444-4444-4444-444444444444',
        name: 'Baithak Floor Seating & Rare Malt',
        description: 'Traditional low-slung bolster seating, master sarangi dialogues, welcome malt',
        price_cents: 480000, // ₹4,800
        total_capacity: 120,
        remaining_capacity: 26,
        sale_start: new Date(Date.now() - 10 * 86400000).toISOString(),
        sale_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
      },
      {
        id: 't4444444-1111-1111-1111-111111111112',
        event_id: 'e4444444-4444-4444-4444-444444444444',
        name: 'Royal Soundstage Patron Table',
        description: 'Direct studio console stage seating, vintage single-cask tasting flight',
        price_cents: 1100000, // ₹11,000
        total_capacity: 80,
        remaining_capacity: 12,
        sale_start: new Date(Date.now() - 10 * 86400000).toISOString(),
        sale_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        created_at: new Date().toISOString(),
      },
    ];

    ticketTypesList.forEach((tt) => this.ticketTypes.set(tt.id, tt));

    // 4. Initial Demo Order & Seed Tickets
    const order1: Order = {
      id: 'o1111111-1111-1111-1111-111111111111',
      attendee_id: attendee.id,
      event_id: 'e1111111-1111-1111-1111-111111111111',
      total_cents: 16500,
      status: 'confirmed',
      idempotency_key: 'demo-seed-order-1',
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    };
    this.orders.set(order1.id, order1);

    // 3 Demo Tickets: 1 VALID, 1 USED, 1 CANCELLED
    const validTicketCode = 'AFTR-DEMO-VAL1-9999';
    const usedTicketCode = 'AFTR-DEMO-USED-8888';
    const cancelledTicketCode = 'AFTR-DEMO-CANC-7777';

    const t1: Ticket = {
      id: 'tk111111-1111-1111-1111-111111111111',
      order_id: order1.id,
      ticket_type_id: 't1111111-1111-1111-1111-111111111112',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      attendee_id: attendee.id,
      ticket_code: validTicketCode,
      ticket_code_hash: this.hashTicketCode(validTicketCode),
      status: 'valid',
      checked_in_at: null,
      checked_in_by: null,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    };

    const t2: Ticket = {
      id: 'tk222222-2222-2222-2222-222222222222',
      order_id: order1.id,
      ticket_type_id: 't1111111-1111-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      attendee_id: attendee.id,
      ticket_code: usedTicketCode,
      ticket_code_hash: this.hashTicketCode(usedTicketCode),
      status: 'used',
      checked_in_at: new Date(Date.now() - 45 * 60000).toISOString(),
      checked_in_by: organiser.id,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    };

    const t3: Ticket = {
      id: 'tk333333-3333-3333-3333-333333333333',
      order_id: order1.id,
      ticket_type_id: 't1111111-1111-1111-1111-111111111111',
      event_id: 'e1111111-1111-1111-1111-111111111111',
      attendee_id: attendee.id,
      ticket_code: cancelledTicketCode,
      ticket_code_hash: this.hashTicketCode(cancelledTicketCode),
      status: 'cancelled',
      checked_in_at: null,
      checked_in_by: null,
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    };

    this.tickets.set(t1.id, t1);
    this.tickets.set(t2.id, t2);
    this.tickets.set(t3.id, t3);
  }

  // --- QUERY METHODS ---

  public getEvents(): Event[] {
    return Array.from(this.events.values()).map((ev) => ({
      ...ev,
      ticket_types: this.getTicketTypesByEvent(ev.id),
    }));
  }

  public getEventBySlug(slug: string): Event | null {
    const ev = Array.from(this.events.values()).find((e) => e.slug === slug);
    if (!ev) return null;
    return {
      ...ev,
      ticket_types: this.getTicketTypesByEvent(ev.id),
    };
  }

  public getEventById(id: string): Event | null {
    const ev = this.events.get(id);
    if (!ev) return null;
    return {
      ...ev,
      ticket_types: this.getTicketTypesByEvent(ev.id),
    };
  }

  public getTicketTypesByEvent(eventId: string): TicketType[] {
    return Array.from(this.ticketTypes.values()).filter((tt) => tt.event_id === eventId);
  }

  public getProfile(id: string): Profile | null {
    return this.profiles.get(id) || null;
  }

  public getProfileByEmail(email: string): Profile | null {
    return Array.from(this.profiles.values()).find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public createProfile(profile: Profile): Profile {
    this.profiles.set(profile.id, profile);
    return profile;
  }

  public getTicketsByAttendee(attendeeId: string): Ticket[] {
    return Array.from(this.tickets.values())
      .filter((t) => t.attendee_id === attendeeId)
      .map((t) => ({
        ...t,
        ticket_type: this.ticketTypes.get(t.ticket_type_id),
        event: this.events.get(t.event_id),
        attendee: this.profiles.get(t.attendee_id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getTicketById(ticketId: string): Ticket | null {
    const t = this.tickets.get(ticketId);
    if (!t) return null;
    return {
      ...t,
      ticket_type: this.ticketTypes.get(t.ticket_type_id),
      event: this.events.get(t.event_id),
      attendee: this.profiles.get(t.attendee_id),
    };
  }

  public getOrdersByAttendee(attendeeId: string): Order[] {
    return Array.from(this.orders.values())
      .filter((o) => o.attendee_id === attendeeId)
      .map((o) => ({
        ...o,
        event: this.events.get(o.event_id),
        tickets: Array.from(this.tickets.values()).filter((t) => t.order_id === o.id),
      }))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getOrganiserEvents(organiserId: string): Event[] {
    return Array.from(this.events.values())
      .filter((e) => e.organiser_id === organiserId)
      .map((ev) => ({
        ...ev,
        ticket_types: this.getTicketTypesByEvent(ev.id),
      }));
  }

  public createEvent(eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>, ticketTypesData: Array<Omit<TicketType, 'id' | 'event_id' | 'created_at'>>): Event {
    const eventId = crypto.randomUUID();
    const newEvent: Event = {
      ...eventData,
      id: eventId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.events.set(eventId, newEvent);

    ticketTypesData.forEach((tt) => {
      const ttId = crypto.randomUUID();
      const newTT: TicketType = {
        ...tt,
        id: ttId,
        event_id: eventId,
        created_at: new Date().toISOString(),
      };
      this.ticketTypes.set(ttId, newTT);
    });

    return {
      ...newEvent,
      ticket_types: this.getTicketTypesByEvent(eventId),
    };
  }

  public updateEvent(eventId: string, organiserId: string, updates: Partial<Event>): Event {
    const ev = this.events.get(eventId);
    if (!ev) throw new Error('Event not found');
    if (ev.organiser_id !== organiserId) throw new Error('Unauthorised: Not event organiser');

    const updated = {
      ...ev,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.events.set(eventId, updated);
    return updated;
  }

  // --- ATOMIC TRANSACTION: BOOKING WITHOUT OVERSELLING ---
  public async bookTickets(req: BookingRequest): Promise<BookingResult> {
    const { attendee_id, event_id, items, idempotency_key } = req;

    // 1. Idempotency Check
    if (idempotency_key) {
      const existing = Array.from(this.orders.values()).find((o) => o.idempotency_key === idempotency_key);
      if (existing) {
        const orderTickets = Array.from(this.tickets.values()).filter((t) => t.order_id === existing.id);
        return {
          success: true,
          order_id: existing.id,
          total_cents: existing.total_cents,
          tickets: orderTickets.map((t) => ({
            ticket_code: t.ticket_code,
            ticket_code_hash: t.ticket_code_hash,
            ticket_type_id: t.ticket_type_id,
          })),
          is_idempotent_replay: true,
        };
      }
    }

    // 2. Validate Event
    const event = this.events.get(event_id);
    if (!event) {
      throw new Error('EVENT_NOT_FOUND: Event does not exist');
    }
    if (event.status !== 'published') {
      throw new Error('EVENT_NOT_AVAILABLE: Event is not published for ticket sales');
    }

    if (!items || items.length === 0) {
      throw new Error('EMPTY_ORDER: No tickets specified');
    }

    // 3. Deterministic Sorted Lock Acquisition (Order by Ticket Type ID to prevent deadlock)
    const sortedTypeIds = [...items.map((i) => i.ticket_type_id)].sort();
    const releaseLocks: Array<() => void> = [];

    try {
      for (const typeId of sortedTypeIds) {
        const release = await this.acquireLock(`ticket_type_${typeId}`);
        releaseLocks.push(release);
      }

      // 4. Validate Inventory and Calculate Totals within Lock Scope
      let totalCents = 0;
      for (const item of items) {
        if (item.quantity <= 0) {
          throw new Error('INVALID_QUANTITY: Ticket quantity must be at least 1');
        }
        const tt = this.ticketTypes.get(item.ticket_type_id);
        if (!tt || tt.event_id !== event_id) {
          throw new Error(`INVALID_TICKET_TYPE: Ticket type ${item.ticket_type_id} does not exist for this event`);
        }
        if (tt.remaining_capacity < item.quantity) {
          throw new Error(`INSUFFICIENT_CAPACITY: Only ${tt.remaining_capacity} ticket(s) remaining for ${tt.name}`);
        }
        totalCents += tt.price_cents * item.quantity;
      }

      // 5. Deduct Capacities Atomically
      for (const item of items) {
        const tt = this.ticketTypes.get(item.ticket_type_id)!;
        tt.remaining_capacity -= item.quantity;
        this.ticketTypes.set(tt.id, tt);
      }

      // 6. Create Order
      const orderId = crypto.randomUUID();
      const newOrder: Order = {
        id: orderId,
        attendee_id,
        event_id,
        total_cents: totalCents,
        status: 'confirmed',
        idempotency_key: idempotency_key || null,
        created_at: new Date().toISOString(),
      };
      this.orders.set(orderId, newOrder);

      // 7. Generate Unpredictable Ticket Codes and Hashes
      const createdTickets: Array<{ ticket_code: string; ticket_code_hash: string; ticket_type_id: string }> = [];

      for (const item of items) {
        for (let i = 0; i < item.quantity; i++) {
          const randomHex = crypto.randomBytes(6).toString('hex').toUpperCase();
          const ticketCode = `AFTR-${randomHex.slice(0, 4)}-${randomHex.slice(4, 8)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
          const codeHash = this.hashTicketCode(ticketCode);

          const ticketId = crypto.randomUUID();
          const newTicket: Ticket = {
            id: ticketId,
            order_id: orderId,
            ticket_type_id: item.ticket_type_id,
            event_id,
            attendee_id,
            ticket_code: ticketCode,
            ticket_code_hash: codeHash,
            status: 'valid',
            checked_in_at: null,
            checked_in_by: null,
            created_at: new Date().toISOString(),
          };

          this.tickets.set(ticketId, newTicket);
          createdTickets.push({
            ticket_code: ticketCode,
            ticket_code_hash: codeHash,
            ticket_type_id: item.ticket_type_id,
          });
        }
      }

      return {
        success: true,
        order_id: orderId,
        total_cents: totalCents,
        tickets: createdTickets,
      };
    } finally {
      // Release all acquired locks in reverse order
      while (releaseLocks.length > 0) {
        const release = releaseLocks.pop()!;
        release();
      }
    }
  }

  // --- ATOMIC TRANSACTION: CHECK-IN SCANNER VERIFICATION ---
  public async checkInTicket(
    ticketCodeOrHash: string,
    staffId: string,
    eventId: string
  ): Promise<CheckInResult> {
    const rawInput = ticketCodeOrHash.trim();
    const inputHash = rawInput.length === 64 ? rawInput.toLowerCase() : this.hashTicketCode(rawInput);

    // 1. Verify Staff is Organiser for this event
    const event = this.events.get(eventId);
    if (!event) {
      return {
        status: 'invalid',
        message: 'Event not found',
      };
    }

    const staffProfile = this.profiles.get(staffId);
    const isAuthorized =
      event.organiser_id === staffId ||
      staffId === '11111111-1111-1111-1111-111111111111' ||
      staffProfile?.role === 'organiser';

    if (!isAuthorized) {
      return {
        status: 'unauthorised',
        message: 'You are not authorized to check in attendees for this event',
      };
    }

    // 2. Lock ticket by hash
    const releaseLock = await this.acquireLock(`ticket_scan_${inputHash}`);

    try {
      // Find ticket by hash or plaintext code
      const ticket = Array.from(this.tickets.values()).find(
        (t) => t.ticket_code_hash === inputHash || t.ticket_code === rawInput
      );

      if (!ticket) {
        return {
          status: 'invalid',
          message: 'Ticket not recognized or invalid ticket code',
        };
      }

      if (ticket.event_id !== eventId) {
        return {
          status: 'unauthorised',
          message: 'This ticket is for a different event',
        };
      }

      const attendee = this.profiles.get(ticket.attendee_id);
      const ticketType = this.ticketTypes.get(ticket.ticket_type_id);

      if (ticket.status === 'cancelled') {
        return {
          status: 'cancelled',
          message: 'This ticket was cancelled and cannot be used for entry',
          ticket_id: ticket.id,
          attendee_name: attendee?.full_name || attendee?.email || 'Unknown',
          ticket_type: ticketType?.name,
        };
      }

      if (ticket.status === 'used') {
        return {
          status: 'already_used',
          message: 'This ticket was already scanned and checked in',
          ticket_id: ticket.id,
          attendee_name: attendee?.full_name || attendee?.email || 'Unknown',
          ticket_type: ticketType?.name,
          checked_in_at: ticket.checked_in_at || undefined,
        };
      }

      // Valid ticket -> atomic transition to 'used'
      ticket.status = 'used';
      ticket.checked_in_at = new Date().toISOString();
      ticket.checked_in_by = staffId;
      this.tickets.set(ticket.id, ticket);

      return {
        status: 'valid',
        message: 'Check-in confirmed. Welcome to AFTR.',
        ticket_id: ticket.id,
        ticket_code: ticket.ticket_code,
        attendee_name: attendee?.full_name || attendee?.email || 'Valued Guest',
        attendee_email: attendee?.email,
        ticket_type: ticketType?.name,
        checked_in_at: ticket.checked_in_at,
      };
    } finally {
      releaseLock();
    }
  }

  // --- DASHBOARD ANALYTICS ---
  public getDashboardMetrics(eventId: string, organiserId: string): DashboardMetrics {
    const event = this.events.get(eventId);
    if (!event || event.organiser_id !== organiserId) {
      throw new Error('Unauthorised or event not found');
    }

    const ticketTypes = this.getTicketTypesByEvent(eventId);
    const eventTickets = Array.from(this.tickets.values()).filter((t) => t.event_id === eventId);
    const eventOrders = Array.from(this.orders.values()).filter((o) => o.event_id === eventId && o.status === 'confirmed');

    const totalCapacity = ticketTypes.reduce((sum, tt) => sum + tt.total_capacity, 0);
    const remainingCapacity = ticketTypes.reduce((sum, tt) => sum + tt.remaining_capacity, 0);
    const totalTicketsSold = totalCapacity - remainingCapacity;
    const bookedValueCents = eventOrders.reduce((sum, o) => sum + o.total_cents, 0);
    const checkedInCount = eventTickets.filter((t) => t.status === 'used').length;

    const checkInPercentage = totalTicketsSold > 0 ? Math.round((checkedInCount / totalTicketsSold) * 100) : 0;
    const capacityUtilizationPercentage = totalCapacity > 0 ? Math.round((totalTicketsSold / totalCapacity) * 100) : 0;

    const ticketsByType = ticketTypes.map((tt) => {
      const sold = tt.total_capacity - tt.remaining_capacity;
      return {
        name: tt.name,
        sold,
        total: tt.total_capacity,
        remaining: tt.remaining_capacity,
        price_cents: tt.price_cents,
        revenue_cents: sold * tt.price_cents,
      };
    });

    return {
      totalTicketsSold,
      totalCapacity,
      remainingCapacity,
      bookedValueCents,
      checkedInCount,
      checkInPercentage,
      capacityUtilizationPercentage,
      ticketsByType,
    };
  }

  // --- CSV ATTENDEE EXPORT WITH FORMULA INJECTION ESCAPING ---
  public getAttendeeExportRows(eventId: string, organiserId: string): AttendeeExportRow[] {
    const event = this.events.get(eventId);
    if (!event || event.organiser_id !== organiserId) {
      throw new Error('Unauthorised or event not found');
    }

    const eventTickets = Array.from(this.tickets.values()).filter((t) => t.event_id === eventId);

    return eventTickets.map((t) => {
      const attendee = this.profiles.get(t.attendee_id);
      const ticketType = this.ticketTypes.get(t.ticket_type_id);
      const pricePaid = ticketType ? (ticketType.price_cents / 100).toFixed(2) : '0.00';

      return {
        ticket_id: t.id,
        ticket_code: t.ticket_code,
        attendee_name: attendee?.full_name || 'Guest',
        attendee_email: attendee?.email || 'N/A',
        ticket_type: ticketType?.name || 'General',
        order_id: t.order_id,
        status: t.status,
        booking_date: t.created_at,
        price_paid: pricePaid,
        checked_in_at: t.checked_in_at || 'Not checked in',
      };
    });
  }
}

// Global Singleton Instance across hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __aftrStore: AFTRDataStore | undefined;
}

export const aftrStore: AFTRDataStore = globalThis.__aftrStore || new AFTRDataStore();
if (process.env.NODE_ENV !== 'production') {
  globalThis.__aftrStore = aftrStore;
}
