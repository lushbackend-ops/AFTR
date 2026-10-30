"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { AttendeeExportRow } from '@/types/database';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Search,
  Download,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Users,
  QrCode,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

interface AttendeesTableProps {
  eventId: string;
  eventTitle: string;
  initialRows: AttendeeExportRow[];
}

export function AttendeesTable({ eventId, eventTitle, initialRows }: AttendeesTableProps) {
  const { user } = useAuth();
  const [rows, setRows] = useState<AttendeeExportRow[]>(initialRows);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'valid' | 'used'>('all');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      const matchSearch =
        r.attendee_name.toLowerCase().includes(search.toLowerCase()) ||
        r.attendee_email.toLowerCase().includes(search.toLowerCase()) ||
        r.ticket_code.toLowerCase().includes(search.toLowerCase()) ||
        r.ticket_type.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rows, search, statusFilter]);

  const checkedInCount = rows.filter((r) => r.status === 'used').length;
  const totalCount = rows.length;
  const checkInRate = totalCount > 0 ? Math.round((checkedInCount / totalCount) * 100) : 0;

  const exportUrl = `/api/organiser/export-csv?event_id=${eventId}&organiser_id=${
    user?.id || '11111111-1111-1111-1111-111111111111'
  }`;

  const handleInlineCheckIn = async (code: string) => {
    try {
      const res = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_code: code,
          staff_id: user?.id || '11111111-1111-1111-1111-111111111111',
          event_id: eventId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === 'valid') {
        setActionFeedback(`Admitted ${data.attendee_name} (${code})`);
        setRows((prev) =>
          prev.map((r) =>
            r.ticket_code === code
              ? { ...r, status: 'used', checked_in_at: new Date().toISOString() }
              : r
          )
        );
        setTimeout(() => setActionFeedback(null), 4000);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6 font-mincho">
      {actionFeedback && (
        <div className="p-4 rounded-[2px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-sans flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-theme-card p-6 rounded-[2px] border border-theme space-y-2 shadow-md">
          <span className="text-[10px] font-sans uppercase tracking-widest text-theme-tertiary">
            Total Booked Passes
          </span>
          <p className="font-mincho text-3xl font-normal text-theme-primary">{totalCount}</p>
        </div>

        <div className="bg-theme-card p-6 rounded-[2px] border border-theme space-y-2 shadow-md">
          <span className="text-[10px] font-sans uppercase tracking-widest text-emerald-400">
            Door Check-Ins
          </span>
          <p className="font-mincho text-3xl font-normal text-emerald-400">
            {checkedInCount}{' '}
            <span className="text-xs font-sans text-theme-tertiary font-normal">
              ({checkInRate}%)
            </span>
          </p>
        </div>

        <div className="bg-theme-card p-6 rounded-[2px] border border-theme space-y-2 shadow-md">
          <span className="text-[10px] font-sans uppercase tracking-widest text-theme-secondary">
            Pending Arrivals
          </span>
          <p className="font-mincho text-3xl font-normal text-theme-primary">
            {totalCount - checkedInCount}
          </p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-theme-card p-6 rounded-[2px] border border-theme flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-theme-tertiary" />
          <input
            type="text"
            placeholder="Search attendee by name, email, or pass code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-theme-subtle border border-theme rounded-[50px] text-xs font-sans text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-theme-accent transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-theme-subtle border border-theme rounded-[50px] p-1">
            {(['all', 'valid', 'used'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3.5 py-1 rounded-[50px] text-xs font-sans transition-all capitalize cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-theme-primary text-theme-inverse font-medium'
                    : 'text-theme-secondary hover:text-theme-primary'
                }`}
              >
                {tab === 'all' ? 'All' : tab === 'valid' ? 'Active' : 'Checked In'}
              </button>
            ))}
          </div>

          {/* CSV Export Button */}
          <a
            href={exportUrl}
            download={`${eventTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-attendees.csv`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[50px] text-xs font-sans tracking-wider uppercase font-medium bg-theme-subtle hover:bg-theme-card text-theme-secondary hover:text-theme-primary border border-theme transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </a>

          {/* Quick Scanner Link */}
          <Link
            href={`/organiser/check-in?event_id=${eventId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[50px] text-xs font-sans tracking-wider uppercase font-medium bg-theme-primary text-theme-inverse hover:opacity-90 transition-opacity shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Launch Scanner</span>
          </Link>
        </div>
      </div>

      {/* Attendees Table */}
      <div className="bg-theme-card rounded-[2px] border border-theme overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-sans">
            <thead className="bg-theme-subtle text-theme-tertiary uppercase tracking-wider border-b border-theme text-[10px]">
              <tr>
                <th className="py-3.5 px-6 font-medium">Attendee</th>
                <th className="py-3.5 px-6 font-medium">Pass Code</th>
                <th className="py-3.5 px-6 font-medium">Tier</th>
                <th className="py-3.5 px-6 font-medium">Status</th>
                <th className="py-3.5 px-6 font-medium">Check-In Time</th>
                <th className="py-3.5 px-6 font-medium text-right">Price</th>
                <th className="py-3.5 px-6 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme text-theme-secondary">
              {filteredRows.length > 0 ? (
                filteredRows.map((r) => {
                  const isCheckedIn = r.status === 'used';
                  return (
                    <tr key={r.ticket_id} className="hover:bg-theme-subtle/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-mincho text-sm font-normal text-theme-primary">
                          {r.attendee_name}
                        </div>
                        <div className="text-theme-tertiary text-[11px] font-sans">
                          {r.attendee_email}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono text-theme-primary select-all">
                        {r.ticket_code}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-[50px] bg-theme-subtle border border-theme text-theme-secondary text-[10px] uppercase tracking-wider">
                          {r.ticket_type}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[50px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] tracking-wider uppercase">
                            <CheckCircle2 className="w-3 h-3" />
                            Checked In
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[50px] bg-theme-subtle border border-theme text-theme-primary text-[10px] tracking-wider uppercase">
                            <Clock className="w-3 h-3" />
                            Active Pass
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-theme-tertiary text-[11px] font-mono">
                        {r.checked_in_at !== 'Not checked in'
                          ? new Date(r.checked_in_at).toLocaleTimeString()
                          : '—'}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-theme-primary">
                        ₹{Number(r.price_paid).toLocaleString('en-IN')}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {!isCheckedIn ? (
                          <button
                            onClick={() => handleInlineCheckIn(r.ticket_code)}
                            className="px-3 py-1 rounded-[50px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] tracking-wider uppercase transition-colors cursor-pointer"
                          >
                            Check In
                          </button>
                        ) : (
                          <span className="text-[11px] text-theme-tertiary">Admitted</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-theme-tertiary text-xs">
                    No attendees match your filter criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
