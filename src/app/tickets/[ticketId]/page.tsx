import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { aftrStore } from '@/lib/services/mock-store';
import { DigitalTicket } from '@/components/tickets/digital-ticket';
import { ScrollLine, SectionScrollDivider } from '@/components/ui/scroll-lines';
import { ArrowLeft, Smartphone, ShieldCheck } from 'lucide-react';

interface TicketPageProps {
  params: Promise<{ ticketId: string }>;
}

export default async function SingleTicketPage({ params }: TicketPageProps) {
  const { ticketId } = await params;
  const ticket = aftrStore.getTicketById(ticketId);

  if (!ticket) {
    notFound();
  }

  return (
    <div className="bg-theme-base text-theme-primary min-h-screen font-mincho py-16 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 sm:px-12 space-y-10">
        {/* Top Navigation */}
        <div className="flex items-center justify-between pb-4">
          <Link
            href="/my-tickets"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[50px] text-xs font-sans tracking-widest uppercase bg-theme-card hover:bg-theme-subtle text-theme-secondary border border-theme transition-all duration-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Passes</span>
          </Link>

          <span className="text-xs font-sans tracking-wider text-theme-tertiary">
            Ref: <span className="font-mono text-theme-primary font-medium">{ticket.ticket_code}</span>
          </span>
        </div>

        <ScrollLine direction="horizontal" origin="left" />

        {/* Main Digital Ticket Display */}
        <div className="py-6">
          <DigitalTicket ticket={ticket} />
        </div>

        <SectionScrollDivider number="SECURITY" label="OPTICAL VALIDATION & PROTOCOLS" />

        {/* Door Check-In Guidance Cards */}
        <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-theme-card p-6 rounded-[2px] border border-theme space-y-2 shadow-md">
            <div className="flex items-center gap-2 text-theme-primary text-xs font-sans uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Door Scanning</span>
            </div>
            <p className="text-xs text-theme-secondary leading-relaxed font-mincho">
              Please turn up your device screen brightness when approaching door staff for immediate optical scan.
            </p>
          </div>

          <div className="bg-theme-card p-6 rounded-[2px] border border-theme space-y-2 shadow-md">
            <div className="flex items-center gap-2 text-theme-primary text-xs font-sans uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Single Entry</span>
            </div>
            <p className="text-xs text-theme-secondary leading-relaxed font-mincho">
              Each ticket code is cryptographically hashed. Once scanned at entry, it transitions atomically to used.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
