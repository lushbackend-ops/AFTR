"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types/database';
import { useAuth } from '@/lib/auth/auth-context';
import { ScrollLine } from '@/components/ui/scroll-lines';
import {
  Plus,
  QrCode,
  Users,
  ArrowUpRight,
  Calendar,
  MapPin,
  AlertCircle,
  BarChart3,
  Layers,
  ArrowLeft,
} from 'lucide-react';

export default function OrganiserEventsPage() {
  const { user, isOrganiser, quickSwitch } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      setError(null);
      try {
        const organiserId = user?.id || '11111111-1111-1111-1111-111111111111';
        const res = await fetch(`/api/events?organiser_id=${organiserId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch events');
        setEvents(data.events || []);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error loading events';
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, [user?.id]);

  return (
    <div className="bg-theme-base text-theme-primary min-h-screen font-mincho py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-8">
        {/* Organiser Banner if currently in Attendee Mode */}
        {!isOrganiser && (
          <div className="p-5 rounded-[2px] bg-theme-card border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-sans uppercase tracking-wider text-theme-primary font-semibold">
                  Viewing in Attendee Session ({user?.full_name || 'Guest'})
                </p>
                <p className="text-xs font-mincho text-theme-secondary">
                  Switch to Organiser mode to manage gathering allocations, gate rosters, and edit configurations.
                </p>
              </div>
            </div>
            <button
              onClick={() => quickSwitch('organiser')}
              className="px-6 py-2.5 rounded-[50px] bg-theme-primary text-theme-inverse text-xs font-sans uppercase tracking-[0.2em] font-medium hover:opacity-90 transition-opacity shrink-0 cursor-pointer shadow-sm"
            >
              Switch to Organiser Mode (Arjun Mehta)
            </button>
          </div>
        )}

        {/* Secondary Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[2px] bg-theme-card border border-theme shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/organiser"
              className="px-5 py-2 rounded-[50px] text-xs font-sans tracking-wider uppercase text-theme-secondary hover:text-theme-primary transition-colors border border-theme"
            >
              Analytics &amp; Door
            </Link>
            <Link
              href="/organiser/events"
              className="px-5 py-2 rounded-[50px] text-xs font-sans tracking-wider uppercase font-medium bg-theme-primary text-theme-inverse shadow-sm"
            >
              Manage Gatherings
            </Link>
            <Link
              href="/organiser/check-in"
              className="px-5 py-2 rounded-[50px] text-xs font-sans tracking-wider uppercase text-theme-secondary hover:text-theme-primary transition-colors border border-theme"
            >
              Door Scanner
            </Link>
            <Link
              href="/events"
              className="px-5 py-2 rounded-[50px] text-xs font-sans tracking-wider uppercase text-theme-secondary hover:text-theme-primary transition-colors"
            >
              Public Catalog
            </Link>
          </div>

          <Link
            href="/organiser/events/new"
            className="inline-flex items-center gap-2 px-6 py-2 rounded-[50px] text-xs font-sans uppercase tracking-[0.2em] font-medium bg-theme-primary text-theme-inverse hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Gathering</span>
          </Link>
        </div>

        <ScrollLine direction="horizontal" origin="left" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-4 border-b border-theme">
          <div className="space-y-1">
            <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-theme-tertiary block">
              AFTR Collective Portfolio • Multi-Venue Curation
            </span>
            <h1 className="font-mincho text-3xl sm:text-5xl font-normal text-theme-primary tracking-tight">
              Curated Gatherings
            </h1>
          </div>
          <p className="text-xs font-sans text-theme-tertiary tracking-widest uppercase">
            {events.length} Active Gatherings
          </p>
        </div>

        {/* Events List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 rounded-[2px] bg-theme-card border border-theme animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 rounded-[2px] bg-theme-card text-center space-y-3 border border-red-500/20 shadow-xl">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-sm font-mincho text-theme-secondary">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 rounded-[2px] bg-theme-card text-center space-y-4 max-w-md mx-auto border border-theme shadow-xl">
            <p className="font-mincho text-2xl font-normal text-theme-primary">
              No Gatherings Published Yet
            </p>
            <p className="text-xs font-mincho text-theme-secondary leading-relaxed">
              Create your first boutique gathering to allocate ticket tiers, configure concurrency locks, and start optical gate check-ins.
            </p>
            <Link
              href="/organiser/events/new"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-[50px] text-xs font-sans uppercase tracking-[0.2em] font-medium bg-theme-primary text-theme-inverse hover:opacity-90 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Gathering</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((ev) => {
              const startDate = new Date(ev.start_time);
              const totalRemaining = ev.ticket_types
                ? ev.ticket_types.reduce((a, b) => a + b.remaining_capacity, 0)
                : ev.capacity;
              const totalCap = ev.capacity || 1;
              const sold = Math.max(0, totalCap - totalRemaining);
              const soldPercent = Math.min(100, Math.round((sold / totalCap) * 100));

              return (
                <div
                  key={ev.id}
                  className="bg-theme-card p-6 sm:p-8 rounded-[2px] border border-theme hover:border-theme-accent transition-all duration-300 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  {/* Event Summary */}
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-[2px] overflow-hidden shrink-0 border border-theme">
                      <Image
                        src={ev.hero_image}
                        alt={ev.title}
                        fill
                        className="object-cover filter grayscale-[15%] hover:grayscale-0 transition-all duration-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-[50px] text-[10px] font-sans uppercase tracking-widest bg-theme-subtle border border-theme text-theme-secondary">
                          {ev.category}
                        </span>
                        <span className="text-[10px] font-sans text-emerald-400 font-medium uppercase tracking-wider">
                          • Published
                        </span>
                      </div>

                      <h2 className="font-mincho text-xl sm:text-2xl font-normal text-theme-primary">
                        {ev.title}
                      </h2>

                      <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-theme-secondary">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-theme-primary" />
                          <span suppressHydrationWarning>
                            {startDate.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              timeZone: 'Asia/Kolkata',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-theme-primary" />
                          <span>
                            {ev.venue_name}, {ev.city}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="w-full lg:w-64 space-y-2">
                    <div className="flex items-center justify-between text-xs font-sans">
                      <span className="text-theme-tertiary uppercase text-[10px] tracking-wider">Capacity</span>
                      <span className="text-theme-primary font-mono">
                        {sold} / {totalCap} ({soldPercent}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-theme-subtle overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${soldPercent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-sans text-theme-tertiary">
                      <span>{totalRemaining} spots remaining</span>
                      <span>{ev.ticket_types?.length || 0} tiers</span>
                    </div>
                  </div>

                  {/* Operations Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-theme">
                    <Link
                      href={`/organiser?event_id=${ev.id}`}
                      className="px-5 py-2.5 rounded-[50px] text-xs font-sans tracking-widest uppercase font-medium bg-theme-primary text-theme-inverse hover:opacity-90 transition-opacity shadow-sm flex items-center gap-1.5"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                      <span>Telemetry</span>
                    </Link>

                    <Link
                      href={`/organiser/check-in?event_id=${ev.id}`}
                      className="px-4 py-2.5 rounded-[50px] text-xs font-sans tracking-widest uppercase text-theme-secondary hover:text-theme-primary border border-theme hover:border-theme-accent transition-colors flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Scanner</span>
                    </Link>

                    <Link
                      href={`/organiser/events/${ev.id}/attendees`}
                      className="px-4 py-2.5 rounded-[50px] text-xs font-sans tracking-widest uppercase text-theme-secondary hover:text-theme-primary border border-theme hover:border-theme-accent transition-colors flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Roster</span>
                    </Link>

                    <Link
                      href={`/events/${ev.slug}`}
                      target="_blank"
                      className="p-2.5 rounded-[50px] text-theme-tertiary hover:text-theme-primary border border-theme hover:border-theme-accent transition-colors"
                      title="View public page"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
