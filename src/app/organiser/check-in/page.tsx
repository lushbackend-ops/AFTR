"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { aftrStore } from '@/lib/services/mock-store';
import { TicketScanner } from '@/components/scanner/ticket-scanner';
import { ScrollLine, SectionScrollDivider } from '@/components/ui/scroll-lines';
import { Event } from '@/types/database';
import { ArrowLeft, QrCode } from 'lucide-react';

function CheckInContent() {
  const searchParams = useSearchParams();
  const eventIdParam = searchParams.get('event_id');

  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>(eventIdParam || 'e1111111-1111-1111-1111-111111111111');

  useEffect(() => {
    const all = aftrStore.getEvents();
    setEvents(all);
    if (eventIdParam && all.some((e) => e.id === eventIdParam)) {
      setSelectedEventId(eventIdParam);
    } else if (all.length > 0 && !eventIdParam) {
      setSelectedEventId(all[0].id);
    }
  }, [eventIdParam]);

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  return (
    <div className="max-w-2xl mx-auto px-6 sm:px-12 py-12 space-y-8">
      {/* Navigation and Event Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-theme">
        <Link
          href="/organiser"
          className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-theme-secondary hover:text-theme-primary transition-colors bg-theme-card px-5 py-2 rounded-[50px] border border-theme w-fit"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Organiser Hub</span>
        </Link>

        {events.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans uppercase tracking-wider text-theme-tertiary">Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-theme-card border border-theme rounded-[50px] px-4 py-1.5 text-xs text-theme-primary focus:outline-none focus:border-theme-accent cursor-pointer"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id} className="bg-theme-card text-theme-primary">
                  {ev.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="text-center space-y-2">
        <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-theme-tertiary block">
          Gate Control &amp; Validation
        </span>
        <h1 className="font-mincho text-3xl sm:text-4xl font-normal text-theme-primary">
          Door Scanner
        </h1>
        <p className="text-xs font-mincho text-theme-secondary">
          Scanning passes for <span className="text-theme-primary font-medium">{currentEvent?.title || 'Selected Gathering'}</span>
        </p>
      </div>

      <ScrollLine direction="horizontal" origin="center" />

      {/* Camera / Manual Verification Component */}
      <TicketScanner
        eventId={selectedEventId}
        eventTitle={currentEvent?.title || 'Selected Gathering'}
      />
    </div>
  );
}

export default function CheckInPage() {
  return (
    <div className="bg-theme-base text-theme-primary min-h-screen font-mincho transition-colors duration-300">
      <Suspense fallback={<div className="p-12 text-center text-xs font-sans text-theme-tertiary">Initializing scanner...</div>}>
        <CheckInContent />
      </Suspense>
    </div>
  );
}
