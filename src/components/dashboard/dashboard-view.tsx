"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Event, DashboardMetrics, AttendeeExportRow } from '@/types/database';
import { useAuth } from '@/lib/auth/auth-context';
import { ScrollLine } from '@/components/ui/scroll-lines';
import {
  IndianRupee,
  Ticket,
  Users,
  QrCode,
  Download,
  Plus,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export function DashboardView({ initialEventId }: { initialEventId?: string }) {
  const { user, isOrganiser, quickSwitch } = useAuth();
  const [selectedEventId, setSelectedEventId] = useState<string>(
    initialEventId || 'e1111111-1111-1111-1111-111111111111'
  );
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [attendees, setAttendees] = useState<AttendeeExportRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Quick manual door check-in state
  const [manualCode, setManualCode] = useState<string>('');
  const [isCheckingIn, setIsCheckingIn] = useState<boolean>(false);
  const [checkInFeedback, setCheckInFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    attendee?: string;
    tier?: string;
    time?: string;
  } | null>(null);

  // Attendee search and filter
  const [attendeeSearch, setAttendeeSearch] = useState<string>('');
  const [attendeeFilter, setAttendeeFilter] = useState<'all' | 'valid' | 'used'>('all');

  async function loadDashboard(showRefreshSpinner = false) {
    if (showRefreshSpinner) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    try {
      const organiserId = user?.id || '11111111-1111-1111-1111-111111111111';
      const res = await fetch(
        `/api/organiser/dashboard?event_id=${selectedEventId}&organiser_id=${organiserId}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load metrics');
      }

      setEvents(data.events || []);
      setCurrentEvent(data.event || null);
      setMetrics(data.metrics || null);
      setAttendees(data.attendees || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading dashboard';
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, [selectedEventId, user?.id]);

  // Handle Quick Manual Check-In
  const handleManualCheckIn = async (codeToVerify?: string) => {
    const code = (codeToVerify || manualCode).trim();
    if (!code) return;

    setIsCheckingIn(true);
    setCheckInFeedback(null);

    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_code: code,
          staff_id: currentEvent?.organiser_id || '11111111-1111-1111-1111-111111111111',
          event_id: currentEvent?.id || selectedEventId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.status === 'valid') {
        setCheckInFeedback({
          type: 'success',
          message: `Verified: ${data.attendee_name || 'Attendee'} admitted successfully!`,
          attendee: data.attendee_name,
          tier: data.ticket_type,
          time: new Date().toLocaleTimeString(),
        });
        setManualCode('');
        // Refresh metrics and attendee list in background
        loadDashboard(true);
      } else if (data.status === 'already_used') {
        setCheckInFeedback({
          type: 'warning',
          message: `ALREADY SCANNED: Pass was checked in at ${
            data.checked_in_at ? new Date(data.checked_in_at).toLocaleTimeString() : 'door'
          }.`,
          attendee: data.attendee_name,
          tier: data.ticket_type,
        });
      } else {
        setCheckInFeedback({
          type: 'error',
          message: data.message || 'Invalid or unrecognized pass code.',
        });
      }
    } catch (err: unknown) {
      setCheckInFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Door validation failed.',
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Filtered attendees
  const filteredAttendees = attendees.filter((a) => {
    const matchSearch =
      a.attendee_name.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      a.attendee_email.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      a.ticket_code.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
      a.ticket_type.toLowerCase().includes(attendeeSearch.toLowerCase());
    const matchStatus = attendeeFilter === 'all' || a.status === attendeeFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8 font-mincho">
      {/* Organiser Role Banner (if currently in attendee mode) */}
      {!isOrganiser && (
        <div className="p-5 rounded-[2px] bg-theme-card border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-sans uppercase tracking-wider text-theme-primary font-semibold">
                Viewing in Attendee Session ({user?.full_name || 'Guest'})
              </p>
              <p className="text-xs font-mincho text-theme-secondary">
                You are viewing real-time capacity and check-in telemetry. Switch to Organiser mode to access production controls.
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

      {/* Top Controls: Event Selector & Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-theme">
        <div className="space-y-1">
          <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-theme-tertiary block">
            Operations &amp; Telemetry • Live Concurrency
          </span>
          <h1 className="font-mincho text-3xl sm:text-4xl font-normal text-theme-primary">
            Capacity &amp; Door Control
          </h1>
          {currentEvent && (
            <p className="text-xs font-sans text-theme-secondary tracking-wider">
              {currentEvent.venue_name}, {currentEvent.city} • Capacity: {currentEvent.capacity}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Event Picker */}
          {events.length > 0 && (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="bg-theme-card border border-theme rounded-[50px] px-5 py-2.5 text-xs font-sans tracking-wider text-theme-primary focus:outline-none focus:border-theme-accent cursor-pointer shadow-sm"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id} className="bg-theme-card text-theme-primary">
                  {ev.title} ({ev.city})
                </option>
              ))}
            </select>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => loadDashboard(true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-[50px] border border-theme bg-theme-card hover:bg-theme-subtle text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
            title="Refresh Live Metrics"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-theme-primary' : ''}`}
            />
          </button>

          {/* Door Scanner View */}
          <Link
            href={`/organiser/check-in?event_id=${selectedEventId}`}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-[50px] text-xs font-sans tracking-widest uppercase font-medium bg-theme-primary text-theme-inverse hover:opacity-90 transition-opacity shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Door Scanner</span>
          </Link>

          {/* Export CSV */}
          <a
            href={`/api/organiser/export-csv?event_id=${selectedEventId}&organiser_id=${user?.id}`}
            download
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-[50px] text-xs font-sans tracking-widest uppercase text-theme-secondary hover:text-theme-primary border border-theme hover:border-theme-accent transition-colors bg-theme-card shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-[2px] bg-red-500/10 border border-red-500/30 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue */}
          <div className="bg-theme-card p-6 rounded-[2px] border border-theme space-y-3 shadow-md">
            <div className="flex items-center justify-between text-theme-tertiary text-xs font-sans tracking-wider uppercase">
              <span>Booked Value</span>
              <IndianRupee className="w-4 h-4 text-theme-primary" />
            </div>
            <p className="font-mincho text-3xl font-normal text-theme-primary">
              ₹{(metrics.bookedValueCents / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
            </p>
            <ScrollLine direction="horizontal" origin="left" />
            <p className="text-[10px] text-theme-tertiary font-sans">Gross reservation volume</p>
          </div>

          {/* Tickets Sold */}
          <div className="bg-theme-card p-6 rounded-[2px] border border-theme space-y-3 shadow-md">
            <div className="flex items-center justify-between text-theme-tertiary text-xs font-sans tracking-wider uppercase">
              <span>Passes Sold</span>
              <Ticket className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-mincho text-3xl font-normal text-theme-primary">
              {metrics.totalTicketsSold}{' '}
              <span className="text-xs font-sans text-theme-tertiary">/ {metrics.totalCapacity}</span>
            </p>
            <div className="w-full bg-theme-subtle rounded-full h-1 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.capacityUtilizationPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-theme-secondary font-sans">
              {metrics.capacityUtilizationPercentage}% total capacity utilized
            </p>
          </div>

          {/* Check-ins */}
          <div className="bg-theme-card p-6 rounded-[2px] border border-theme space-y-3 shadow-md">
            <div className="flex items-center justify-between text-theme-tertiary text-xs font-sans tracking-wider uppercase">
              <span>Verified Check-Ins</span>
              <Users className="w-4 h-4 text-theme-primary" />
            </div>
            <p className="font-mincho text-3xl font-normal text-theme-primary">
              {metrics.checkedInCount}{' '}
              <span className="text-xs font-sans text-theme-tertiary">
                ({metrics.checkInPercentage}%)
              </span>
            </p>
            <div className="w-full bg-theme-subtle rounded-full h-1 overflow-hidden">
              <div
                className="bg-theme-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.checkInPercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-theme-secondary font-sans">At-the-door gate throughput</p>
          </div>

          {/* Remaining Capacity */}
          <div className="bg-theme-card p-6 rounded-[2px] border border-theme space-y-3 shadow-md">
            <div className="flex items-center justify-between text-theme-tertiary text-xs font-sans tracking-wider uppercase">
              <span>Remaining Passes</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-mincho text-3xl font-normal text-theme-primary">
              {metrics.remainingCapacity}
            </p>
            <ScrollLine direction="horizontal" origin="right" />
            <p className="text-[10px] text-theme-tertiary font-sans">
              Strictly locked by PostgreSQL concurrency
            </p>
          </div>
        </div>
      )}

      {/* Quick Door Check-In Station */}
      <div className="bg-theme-card p-6 sm:p-8 rounded-[2px] border border-theme space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-theme pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="font-mincho text-xl font-normal text-theme-primary">
                Quick Door Check-In Console
              </h2>
            </div>
            <p className="text-xs font-sans text-theme-tertiary">
              Instantly verify and admit attendees by entering or pasting a Pass Code
            </p>
          </div>

          <Link
            href={`/organiser/check-in?event_id=${selectedEventId}`}
            className="inline-flex items-center gap-1.5 text-xs font-sans tracking-wider text-theme-secondary hover:text-theme-primary transition-colors"
          >
            <span>Launch Optical Camera Scanner</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleManualCheckIn();
          }}
          className="flex flex-col sm:flex-row gap-3 pt-2"
        >
          <div className="relative flex-1">
            <QrCode className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-theme-tertiary" />
            <input
              type="text"
              placeholder="e.g. AFTR-4B81-8966-E5E9 or SHA-256 Hash"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-theme-subtle border border-theme rounded-[50px] text-xs font-mono text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-theme-accent transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isCheckingIn || !manualCode.trim()}
            className="px-8 py-3 rounded-[50px] bg-theme-primary text-theme-inverse text-xs font-sans uppercase tracking-[0.2em] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {isCheckingIn ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify &amp; Check In</span>
            )}
          </button>
        </form>

        {/* Check-In Feedback Alert */}
        {checkInFeedback && (
          <div
            className={`p-4 rounded-[2px] border text-xs flex items-center justify-between gap-3 ${
              checkInFeedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : checkInFeedback.type === 'warning'
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {checkInFeedback.type === 'success' ? (
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <ShieldAlert className="w-4 h-4 shrink-0" />
              )}
              <span className="font-sans font-medium">{checkInFeedback.message}</span>
              {checkInFeedback.tier && (
                <span className="text-[11px] px-2 py-0.5 rounded-[50px] bg-theme-card border border-theme text-theme-secondary font-mono">
                  {checkInFeedback.tier}
                </span>
              )}
            </div>
            {checkInFeedback.time && (
              <span className="text-[10px] font-mono text-theme-tertiary">
                Verified at {checkInFeedback.time}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Ticket Tiers Breakdown Table */}
      {metrics && (
        <div className="bg-theme-card rounded-[2px] border border-theme overflow-hidden shadow-xl">
          <div className="p-6 border-b border-theme flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-mincho text-2xl font-normal text-theme-primary">
                Tier Breakdown
              </h2>
              <p className="text-xs font-sans text-theme-tertiary">
                Real-time inventory levels by ticket allocation
              </p>
            </div>
            {currentEvent && (
              <Link
                href={`/events/${currentEvent.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-theme-secondary hover:text-theme-primary transition-colors"
              >
                <span>View Public Page</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-theme-subtle text-theme-tertiary uppercase tracking-wider border-b border-theme">
                <tr>
                  <th className="py-3.5 px-6 font-medium">Tier Name</th>
                  <th className="py-3.5 px-6 font-medium">Price</th>
                  <th className="py-3.5 px-6 font-medium">Sold</th>
                  <th className="py-3.5 px-6 font-medium">Remaining</th>
                  <th className="py-3.5 px-6 font-medium">Capacity</th>
                  <th className="py-3.5 px-6 font-medium">Tier Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme text-theme-secondary">
                {metrics.ticketsByType.map((tt) => (
                  <tr key={tt.name} className="hover:bg-theme-subtle/50 transition-colors">
                    <td className="py-4 px-6 font-mincho text-sm font-normal text-theme-primary">
                      {tt.name}
                    </td>
                    <td className="py-4 px-6 font-mono">
                      ₹{(tt.price_cents / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-6 font-mono text-theme-primary font-medium">{tt.sold}</td>
                    <td className="py-4 px-6 font-mono">
                      <span
                        className={
                          tt.remaining <= 15 ? 'text-amber-400 font-bold' : 'text-theme-primary'
                        }
                      >
                        {tt.remaining}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-mono text-theme-tertiary">{tt.total}</td>
                    <td className="py-4 px-6 font-mono text-theme-primary font-medium">
                      ₹{(tt.revenue_cents / 100).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendees Roster & Status Management */}
      <div className="bg-theme-card rounded-[2px] border border-theme overflow-hidden shadow-xl space-y-4">
        <div className="p-6 border-b border-theme flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-theme-primary" />
              <h2 className="font-mincho text-2xl font-normal text-theme-primary">
                Attendee Roster ({attendees.length})
              </h2>
            </div>
            <p className="text-xs font-sans text-theme-tertiary">
              Manage ticket passes, gate status, and attendee arrivals for this event
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-theme-subtle border border-theme rounded-[50px] p-1">
              {(['all', 'valid', 'used'] as const).map((tab) => {
                const count =
                  tab === 'all'
                    ? attendees.length
                    : attendees.filter((a) => a.status === tab).length;
                return (
                  <button
                    key={tab}
                    onClick={() => setAttendeeFilter(tab)}
                    className={`px-3 py-1 rounded-[50px] text-xs font-sans capitalize transition-all cursor-pointer ${
                      attendeeFilter === tab
                        ? 'bg-theme-primary text-theme-inverse font-medium'
                        : 'text-theme-secondary hover:text-theme-primary'
                    }`}
                  >
                    {tab === 'all' ? 'All' : tab === 'valid' ? 'Active' : 'Checked In'} ({count})
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-theme-tertiary" />
              <input
                type="text"
                placeholder="Search attendees..."
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-theme-subtle border border-theme rounded-[50px] text-xs font-sans text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-theme-accent"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-theme-subtle text-theme-tertiary uppercase tracking-wider border-b border-theme">
              <tr>
                <th className="py-3.5 px-6 font-medium">Attendee</th>
                <th className="py-3.5 px-6 font-medium">Pass Code</th>
                <th className="py-3.5 px-6 font-medium">Tier</th>
                <th className="py-3.5 px-6 font-medium">Status</th>
                <th className="py-3.5 px-6 font-medium">Check-In Time</th>
                <th className="py-3.5 px-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme text-theme-secondary">
              {filteredAttendees.length > 0 ? (
                filteredAttendees.map((a) => {
                  const isCheckedIn = a.status === 'used';
                  return (
                    <tr key={a.ticket_id} className="hover:bg-theme-subtle/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-mincho text-sm text-theme-primary font-normal">
                          {a.attendee_name}
                        </div>
                        <div className="text-[11px] text-theme-tertiary font-sans">
                          {a.attendee_email}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-theme-primary select-all">
                        {a.ticket_code}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-[50px] text-[10px] uppercase font-sans tracking-wider bg-theme-subtle border border-theme text-theme-secondary">
                          {a.ticket_type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[50px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-sans tracking-wider uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[50px] bg-theme-subtle border border-theme text-theme-primary text-[10px] font-sans tracking-wider uppercase">
                            <Clock className="w-3 h-3" />
                            Active Pass
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-mono text-[11px] text-theme-tertiary">
                        {a.checked_in_at !== 'Not checked in'
                          ? new Date(a.checked_in_at).toLocaleTimeString()
                          : '—'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {!isCheckedIn ? (
                          <button
                            onClick={() => handleManualCheckIn(a.ticket_code)}
                            className="px-3.5 py-1.5 rounded-[50px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-sans uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Check In
                          </button>
                        ) : (
                          <span className="text-[11px] text-theme-tertiary font-sans">Admitted</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-theme-tertiary font-sans">
                    {attendeeSearch || attendeeFilter !== 'all'
                      ? 'No attendees match your filter criteria'
                      : 'No attendees registered for this gathering yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isLoading && (
        <div className="p-12 text-center text-xs font-sans text-theme-tertiary">
          Loading metrics from transactional store...
        </div>
      )}
    </div>
  );
}
