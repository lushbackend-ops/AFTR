"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Ticket as TicketType } from '@/types/database';
import { useAuth } from '@/lib/auth/auth-context';
import { aftrStore } from '@/lib/services/mock-store';
import { ScrollLine, SectionScrollDivider } from '@/components/ui/scroll-lines';
import { Ticket, Calendar, MapPin, CheckCircle2, Clock, XCircle, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';

export default function MyTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'valid' | 'used'>('all');

  const fetchTickets = () => {
    setIsLoading(true);
    setError(null);
    try {
      const attendeeId = user?.id || '22222222-2222-2222-2222-222222222222';
      const attendeeTickets = aftrStore.getTicketsByAttendee(attendeeId);
      setTickets(attendeeTickets);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error retrieving passes';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    return aftrStore.subscribe(fetchTickets);
  }, [user?.id]);

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  return (
    <div className="bg-theme-base text-theme-primary min-h-screen font-mincho transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 sm:px-12 py-16 space-y-12">
        {/* Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-sans tracking-[0.3em] uppercase text-theme-tertiary">
                Personal Pass Wallet • Issued Passes
              </span>
              <span className="text-theme-tertiary font-sans text-xs">• {tickets.length} Registered Passes</span>
            </div>
            <h1 className="font-mincho text-4xl sm:text-5xl text-theme-primary font-normal tracking-tight">
              My Digital Passes
            </h1>
            <p className="font-sans text-xs tracking-wider text-theme-secondary">
              Holder: <span className="font-mincho text-theme-primary">{user?.full_name || 'Guest'}</span> ({user?.email})
            </p>
          </div>

          <button
            onClick={fetchTickets}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[50px] text-xs font-sans tracking-widest uppercase bg-theme-card hover:bg-theme-subtle text-theme-secondary border border-theme transition-colors w-fit focus:outline-none cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-theme-primary' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Scroll Line Divider */}
        <ScrollLine direction="horizontal" origin="left" />

        {/* Filter Tabs with 50px pills */}
        <div className="flex items-center gap-2">
          {(['all', 'valid', 'used'] as const).map((tab) => {
            const isSelected = filter === tab;
            const count = tab === 'all' ? tickets.length : tickets.filter(t => t.status === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-5 py-2 rounded-[50px] text-xs font-sans tracking-wider transition-all duration-300 capitalize cursor-pointer ${isSelected
                    ? 'bg-theme-primary text-theme-inverse font-medium shadow-sm'
                    : 'border border-theme text-theme-secondary hover:text-theme-primary hover:border-theme-accent'
                  }`}
              >
                {tab === 'all' ? 'All Passes' : tab === 'valid' ? 'Active Passes' : 'Used / Past'} ({count})
              </button>
            );
          })}
        </div>

        {/* Section Divider */}
        <SectionScrollDivider number="WALLET" label="ACTIVE PASS CODES & ENCRYPTED HASHES" />

        {/* Ticket List State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-56 rounded-[2px] bg-theme-card border border-theme animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-theme-card p-12 rounded-[2px] border border-theme text-center space-y-4 max-w-md mx-auto shadow-xl">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <h3 className="text-xl font-mincho text-theme-primary font-normal">Failed to Load Wallet</h3>
            <p className="text-xs font-mincho text-theme-secondary">{error}</p>
            <button
              onClick={fetchTickets}
              className="px-6 py-2.5 rounded-[50px] border border-theme hover:border-theme-accent text-xs font-sans tracking-widest uppercase text-theme-primary transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-theme-card p-16 rounded-[2px] border border-theme text-center space-y-6 max-w-lg mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-full bg-theme-subtle flex items-center justify-center mx-auto border border-theme">
              <Ticket className="w-6 h-6 text-theme-tertiary" />
            </div>
            <div className="space-y-2">
              <h3 className="font-mincho text-3xl font-normal text-theme-primary">No Passes Found</h3>
              <p className="text-xs font-mincho text-theme-secondary leading-relaxed">
                {filter === 'all'
                  ? 'No passes reserved yet. Explore our curated nocturnal gatherings to reserve your experience.'
                  : `No passes found matching status: ${filter}.`}
              </p>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-[50px] text-xs font-sans font-medium uppercase tracking-[0.25em] bg-theme-primary text-theme-inverse hover:opacity-90 transition-opacity"
            >
              <span>Explore Gatherings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredTickets.map((ticket) => {
              const eventDate = ticket.event ? new Date(ticket.event.start_time) : new Date();
              const formattedDate = eventDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                timeZone: 'Asia/Kolkata',
              });
              const formattedTime = eventDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Kolkata',
              });

              const isValid = ticket.status === 'valid';

              return (
                <div
                  key={ticket.id}
                  className="relative rounded-[2px] bg-theme-card border border-theme hover:border-theme-accent transition-colors duration-500 p-8 space-y-6 flex flex-col justify-between shadow-xl"
                >
                  {/* Top Status & Tier */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="px-3.5 py-1 rounded-[50px] text-[10px] font-sans uppercase tracking-[0.2em] bg-theme-subtle text-theme-secondary border border-theme">
                      {ticket.ticket_type?.name || 'General Admission'}
                    </span>

                    {isValid ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-[50px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-sans tracking-widest uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        ACTIVE
                      </span>
                    ) : ticket.status === 'used' ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-[50px] bg-theme-subtle border border-theme text-theme-tertiary text-[10px] font-sans tracking-widest uppercase">
                        <Clock className="w-3 h-3" />
                        CHECKED IN
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-[50px] bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-sans tracking-widest uppercase">
                        <XCircle className="w-3 h-3" />
                        CANCELLED
                      </span>
                    )}
                  </div>

                  {/* Event Information */}
                  <div className="space-y-3">
                    <h3 className="font-mincho text-2xl font-normal text-theme-primary">
                      {ticket.event?.title || 'Nocturnal Experience'}
                    </h3>
                    <div className="space-y-1.5 text-xs text-theme-secondary font-sans tracking-wider">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-theme-primary" />
                        <span suppressHydrationWarning>{formattedDate} • {formattedTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-theme-primary" />
                        <span>{ticket.event?.venue_name}, {ticket.event?.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Perforation divider with scroll-reactive line */}
                  <div className="pt-6">
                    <ScrollLine direction="horizontal" origin="center" className="mb-4" />

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-theme-tertiary block">
                          Ticket Code
                        </span>
                        <span className="font-mono text-xs text-theme-primary tracking-widest">{ticket.ticket_code}</span>
                      </div>

                      <Link
                        href={`/tickets/${ticket.id}`}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[50px] text-xs font-sans tracking-widest uppercase bg-theme-primary text-theme-inverse font-medium hover:opacity-90 transition-opacity"
                      >
                        <span>Pass &amp; QR</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
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
