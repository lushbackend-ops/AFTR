# AFTR — Premium Nocturnal Event Ticketing Platform

> **Art-Directed Discovery • High-Capacity Transactional Concurrency • Cryptographic QR Door Check-In**

Built with Next.js 16 App Router, TypeScript, Supabase PostgreSQL, Tailwind CSS v4, Lenis Smooth Scroll, and designed under Apple Human Interface Guidelines and modern luxury editorial aesthetics.

---

## 🏛️ Architecture Overview

AFTR is a full-stack event discovery, booking, and door check-in platform engineered to solve real ticketing problems: **concurrent capacity overselling**, **counterfeit passes**, and **door scanning bottlenecks**.

```
[ Client Applications ]
  ├── Public Discovery & Event Pages (/events, /events/[slug])
  ├── Attendee Ticket Wallet (/my-tickets, /tickets/[id])
  ├── Organiser Dashboard & Analytics (/organiser, /organiser/events)
  └── High-Contrast Door Scanner (/organiser/events/[id]/check-in)
        │
        ▼
[ Next.js 16 App Router Server ]
  ├── Transactional Booking Engine (/api/bookings)
  ├── Door Check-In State Machine (/api/check-in)
  ├── Organiser Analytics & Metrics (/api/organiser/dashboard)
  └── Sanitized CSV Export Engine (/api/organiser/export-csv)
        │
        ▼
[ Data Layer ]
  ├── Supabase PostgreSQL (Foreign Keys, Indexes, RLS Policies)
  └── Concurrency Store (Deterministic Row Mutex Locks & Idempotency)
```

---

## ⚡ Concurrency & Anti-Overselling Engine

The most critical requirement in ticketing is ensuring that **concurrent requests can never exceed venue or tier capacity**. 

### Concurrency Guarantees:
1. **Deterministic Lock Ordering**: When transactions request multiple ticket tiers, locks are acquired in sorted ID order to eliminate database deadlocks.
2. **Row-Level Mutex Locking**: Emulates PostgreSQL `SELECT ... FOR UPDATE`, ensuring that available inventory checks and decrements occur atomically inside an isolated transaction.
3. **Idempotency Keys**: Network retries with duplicate `idempotency_key` headers return the previously confirmed order rather than purchasing duplicate tickets.
4. **Zero-Overselling Proof**: Tested with 10 simultaneous sessions contending for the final 1 available ticket; exactly 1 succeeds and 9 fail with `INSUFFICIENT_CAPACITY`.

---

## 🎟️ Cryptographic Ticket Passes & Door State Machine

Tickets in AFTR use physical perforation aesthetics inspired by vintage couture invitations, paired with high-entropy cryptographic security:

- **Unpredictable Codes**: Generated using cryptographic randomness (`AFTR-XXXX-XXXX-XXXX`).
- **One-Way SHA-256 Hashing**: Pass hashes are stored in the database to prevent database leakage from compromising active gate passes.
- **Atomic Gate Check-In Transition**:
  - `valid` ➔ `used` (first scan records timestamp and staff ID)
  - `used` ➔ Returns `already_used` with previous check-in time
  - Unknown code ➔ Returns `invalid`
  - Cancelled ticket ➔ Returns `cancelled`
  - Wrong event ➔ Returns `unauthorised`
- **Audio Feedback**: Pleasant 880Hz chime on valid scan; 220Hz alert buzz on invalid/used scans for fast door throughput.

---

## 📊 Organiser Tools & Data Integrity

- **Live Capacity Monitoring**: Real-time sales, check-in percentage, and remaining spots by tier.
- **Door Check-In Scanner**: Hardware-accelerated camera QR scanner (`html5-qrcode`) with instant manual keyboard fallback.
- **Attendee Roster**: Search by name, email, or pass code with live check-in status filters.
- **Formula Injection Mitigation (CWE-1236)**: The CSV exporter sanitizes cells starting with `=`, `+`, `-`, or `@` by prepending a single quote and doubling quotes to neutralize spreadsheet formula injection vulnerabilities.

---

## 🗄️ Database Schema & RLS

The database schema is defined in [supabase/migrations/20261027000000_create_aftr_schema.sql](file:///c:/code/internship%20assignments/event%20booking/supabase/migrations/20261027000000_create_aftr_schema.sql):

- `profiles`: User accounts with `role` (`attendee` or `organiser`).
- `events`: Gatherings with venue, city, start/end timestamps, hero artwork, and capacity.
- `ticket_types`: Pricing tiers with `total_capacity` and `remaining_capacity`.
- `orders`: Atomic purchase records with total cents, idempotency keys, and attendee reference.
- `tickets`: Cryptographic codes, hashes, status (`valid`, `used`, `cancelled`), and check-in audit timestamps.
- **Row-Level Security (RLS)**: Public read for published events, attendee-only read for personal tickets, organiser-only write/scan access for owned events.

---

## 👤 Pre-Authenticated Demo Accounts

AFTR includes zero-friction demo accounts accessible via the navigation header switcher:

| Role | Name | Email | Capabilities |
|------|------|-------|--------------|
| **Organiser** | Julian Vance | `organiser@aftr.events` | Manage events, publish gatherings, door QR scanner, dashboard metrics, CSV export |
| **Attendee** | Elena Rostova | `attendee@aftr.events` | Browse events, purchase passes, wallet with dynamic QR codes |

---

## 🧪 Automated Test Suite

AFTR includes a 10-test automated verification suite (`tests/aftr-core.test.ts`) covering all core transactional criteria:

```bash
# Run Vitest automated test suite
npm test
```

### Verified Scenarios:
1. ✅ **Successful booking**: Atomically creates order and reduces tier inventory.
2. ✅ **Capacity exceeded**: Rejects orders requesting more than remaining inventory.
3. ✅ **Concurrent race condition**: 10 simultaneous sessions contending for the final ticket; 1 succeeds, 9 fail with 0 oversell.
4. ✅ **Valid check-in**: Successful optical QR scan marks ticket as used with timestamp.
5. ✅ **Double-scan prevention**: Repeated scans return `already_used` with warning.
6. ✅ **Bogus codes**: Unknown or manipulated codes return `invalid`.
7. ✅ **Cancelled passes**: Cancelled tickets return `cancelled`.
8. ✅ **Permission enforcement**: Attendee barred from accessing organiser dashboard.
9. ✅ **Cross-event isolation**: Organiser barred from scanning tickets for another organiser's event.
10. ✅ **Input validation**: Rejects negative quantities and empty booking payloads.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run automated tests
npm test

# Type checking
npx tsc --noEmit
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎨 Design System & Skills Used

- **Apple Design Skill**: Applied clarity, typography hierarchy, restrained gold accents, and contrast standards.
- **Frontend Design & UI/UX Pro Max**: Curated typography (`Cormorant Garamond` serif with `Inter` sans and `JetBrains Mono`), dark obsidian canvas (`#09090b`), ticket perforation notch dividers, and ambient atmospheric glows.
- **Lenis**: Smooth scrolling across editorial narrative sections.
- **Ponytail**: Minimal abstractions, strict standard library adherence, and zero unnecessary dependencies.
