import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { aftrStore } from '@/lib/services/mock-store';
import { TicketScanner } from '@/components/scanner/ticket-scanner';
import { ScrollLine } from '@/components/ui/scroll-lines';
import { ArrowLeft, ShieldCheck, MapPin, Calendar, Users } from 'lucide-react';

interface ScannerPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function CheckInScannerPage({ params }: ScannerPageProps) {
  const { eventId } = await params;
  const event = aftrStore.getEventById(eventId);

  if (!event) {
    notFound();
  }

  const startDate = new Date(event.start_time);

  return (
    <div className="bg-theme-base text-theme-primary min-h-screen font-mincho py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 sm:px-12 space-y-8">
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-4 border-b border-theme">
          <Link
            href="/organiser/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[50px] text-xs font-sans uppercase tracking-widest bg-theme-card hover:bg-theme-subtle text-theme-secondary hover:text-theme-primary border border-theme transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Scanner</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-sans text-theme-tertiary uppercase tracking-wider">
              Door Verification Mode
            </span>
          </div>
        </div>

        {/* Event Context Banner */}
        <div className="bg-theme-card p-6 sm:p-8 rounded-[2px] border border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="space-y-1">
            <span className="text-[10px] font-sans text-theme-tertiary uppercase tracking-widest block">
              {event.category}
            </span>
            <h1 className="font-mincho text-2xl sm:text-3xl font-normal text-theme-primary">
              {event.title}
            </h1>
            <p className="text-xs font-sans text-theme-secondary">
              {event.venue_name}, {event.city} • {startDate.toLocaleDateString()}
            </p>
          </div>

          <Link
            href={`/organiser/events/${event.id}/attendees`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[50px] text-xs font-sans uppercase tracking-wider text-theme-secondary hover:text-theme-primary bg-theme-subtle border border-theme hover:border-theme-accent transition-colors text-center"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Attendee Roster</span>
          </Link>
        </div>

        <ScrollLine direction="horizontal" origin="center" />

        {/* Ticket Scanner Component */}
        <TicketScanner eventId={event.id} eventTitle={event.title} />
      </div>
    </div>
  );
}
