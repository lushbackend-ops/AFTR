"use client";

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Ticket } from '@/types/database';
import { Calendar, MapPin, CheckCircle2, Clock, XCircle, Printer } from 'lucide-react';
import { ScrollLine } from '@/components/ui/scroll-lines';

export function DigitalTicket({ ticket }: { ticket: Ticket }) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(ticket.ticket_code, {
      width: 280,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR Generation failed', err));
  }, [ticket.ticket_code]);

  const eventDate = ticket.event ? new Date(ticket.event.start_time) : new Date();
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
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

  const getStatusBadge = () => {
    switch (ticket.status) {
      case 'valid':
        return (
          <div className="paper-stamp flex items-center gap-1.5 px-3.5 py-1 rounded-[50px] text-[10px] font-sans font-medium uppercase tracking-widest">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ACTIVE PASS</span>
          </div>
        );
      case 'used':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-[50px] bg-theme-subtle border border-theme text-theme-tertiary text-[10px] font-sans font-medium uppercase tracking-widest">
            <Clock className="w-3.5 h-3.5" />
            <span>SCANNED & USED</span>
          </div>
        );
      case 'cancelled':
        return (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-[50px] bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-sans font-medium uppercase tracking-widest">
            <XCircle className="w-3.5 h-3.5" />
            <span>CANCELLED</span>
          </div>
        );
    }
  };

  return (
    <div className="max-w-md mx-auto w-full">
      {/* Physical Ticket Pass Container with Washi Rag Cardstock */}
      <div className="paper-card border border-theme rounded-[2px] shadow-2xl relative overflow-hidden transition-colors duration-300">
        {/* Top Header Section */}
        <div className="p-8 pb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mincho text-2xl font-normal tracking-[0.25em] text-theme-primary uppercase">
                AFTR
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-theme-primary opacity-60" />
              <span className="text-[10px] font-sans text-theme-tertiary uppercase tracking-widest pl-1">
                ADMISSION PASS
              </span>
            </div>
            {getStatusBadge()}
          </div>

          <h2 className="font-mincho text-2xl sm:text-3xl font-normal text-theme-primary tracking-tight leading-snug">
            {ticket.event?.title || 'Exclusive Gathering'}
          </h2>

          <div className="space-y-1.5 text-xs text-theme-secondary font-sans tracking-wider pt-2">
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

        {/* Notched Perforation Divider with Scroll-Line */}
        <div className="relative py-2 flex items-center justify-between px-6 paper-perforation">
          <div className="w-full">
            <ScrollLine direction="horizontal" origin="center" />
          </div>
        </div>

        {/* Middle QR Code Section */}
        <div className="p-8 pt-4 text-center flex flex-col items-center space-y-4">
          <div className="p-4 bg-white rounded-[2px] shadow-lg inline-block border border-theme">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt="Ticket QR Code"
                className="w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-[2px]"
              />
            ) : (
              <div className="w-48 h-48 sm:w-56 sm:h-56 bg-zinc-200 animate-pulse rounded-[2px]" />
            )}
          </div>

          {/* Ticket Reference Code in Monospace */}
          <div className="space-y-1">
            <p className="text-[10px] font-sans text-theme-tertiary uppercase tracking-[0.25em]">
              Encrypted Pass Hash
            </p>
            <p className="font-mono text-sm text-theme-primary tracking-widest select-all bg-theme-subtle py-1.5 px-5 rounded-[2px] inline-block border border-theme">
              {ticket.ticket_code}
            </p>
          </div>

          {/* Check-in timestamp if already used */}
          {ticket.status === 'used' && ticket.checked_in_at && (
            <p className="text-[11px] font-sans text-theme-tertiary">
              Checked in at: {new Date(ticket.checked_in_at).toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Bottom Details Section */}
        <div className="p-6 bg-theme-subtle border-t border-theme text-xs text-theme-secondary grid grid-cols-2 gap-4">
          <div>
            <span className="block text-theme-tertiary uppercase font-sans text-[10px] tracking-wider">Pass Tier</span>
            <span className="font-mincho text-theme-primary text-sm">{ticket.ticket_type?.name || 'General Admission'}</span>
          </div>

          <div>
            <span className="block text-theme-tertiary uppercase font-sans text-[10px] tracking-wider">Pass Holder</span>
            <span className="font-mincho text-theme-primary text-sm truncate block">
              {ticket.attendee?.full_name || ticket.attendee?.email || 'Guest'}
            </span>
          </div>

          <div className="col-span-2 pt-3 border-t border-theme-subtle flex items-center justify-between">
            <span className="text-[10px] font-mono text-theme-tertiary">
              SHA-256: {ticket.ticket_code_hash.substring(0, 16)}...
            </span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 text-[11px] font-sans tracking-wider text-theme-secondary hover:text-theme-primary transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
