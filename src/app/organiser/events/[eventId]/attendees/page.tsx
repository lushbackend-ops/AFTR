import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { aftrStore } from '@/lib/services/mock-store';
import { AttendeesTable } from './attendees-table';
import { ScrollLine } from '@/components/ui/scroll-lines';
import { ArrowLeft, Users, Calendar, MapPin } from 'lucide-react';

interface AttendeesPageProps {
  params: Promise<{ eventId: string }>;
}

export default async function AttendeesPage({ params }: AttendeesPageProps) {
  const { eventId } = await params;
  const event = aftrStore.getEventById(eventId);

  if (!event) {
    notFound();
  }

  // Load attendee records
  const initialRows = aftrStore.getAttendeeExportRows(eventId, event.organiser_id);

  return (
    <div className="bg-theme-base text-theme-primary min-h-screen font-mincho py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-8">
        {/* Top Nav */}
        <div className="flex items-center justify-between pb-4 border-b border-theme">
          <Link
            href="/organiser/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[50px] text-xs font-sans uppercase tracking-widest bg-theme-card hover:bg-theme-subtle text-theme-secondary hover:text-theme-primary border border-theme transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Gatherings</span>
          </Link>

          <span className="text-xs font-sans tracking-wider text-theme-tertiary">
            Event ID: <span className="text-theme-primary font-mono">{event.id.slice(0, 8)}</span>
          </span>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-theme-tertiary block">
            Attendee Management &amp; Gate Verification
          </span>
          <h1 className="font-mincho text-3xl sm:text-5xl font-normal text-theme-primary tracking-tight">
            {event.title}
          </h1>
          <p className="text-xs font-sans text-theme-secondary">
            {event.venue_name}, {event.city} • Capacity: {event.capacity} Attendees
          </p>
        </div>

        <ScrollLine direction="horizontal" origin="left" />

        {/* Interactive Attendees Table */}
        <AttendeesTable
          eventId={event.id}
          eventTitle={event.title}
          initialRows={initialRows}
        />
      </div>
    </div>
  );
}
