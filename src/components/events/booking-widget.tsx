"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Event } from '@/types/database';
import { useAuth } from '@/lib/auth/auth-context';
import { aftrStore } from '@/lib/services/mock-store';
import { ShieldCheck, Plus, Minus, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { ScrollLine } from '@/components/ui/scroll-lines';

export function BookingWidget({ event }: { event: Event }) {
  const router = useRouter();
  const { user } = useAuth();

  // Quantities selected per ticket type id
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  const ticketTypes = event.ticket_types || [];

  const handleQuantityChange = (typeId: string, delta: number, remaining: number) => {
    setErrorMessage(null);
    const current = quantities[typeId] || 0;
    const next = Math.max(0, Math.min(10, Math.min(remaining, current + delta)));
    setQuantities((prev) => ({
      ...prev,
      [typeId]: next,
    }));
  };

  const totalQuantity = Object.values(quantities).reduce((a, b) => a + b, 0);

  const totalCents = ticketTypes.reduce((sum, tt) => {
    const qty = quantities[tt.id] || 0;
    return sum + (tt.price_cents * qty);
  }, 0);

  const handleBooking = async () => {
    if (totalQuantity === 0) {
      setErrorMessage('Please select at least one ticket to proceed');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([ticket_type_id, quantity]) => ({
        ticket_type_id,
        quantity,
      }));

    const idempotencyKey = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    try {
      const result = await aftrStore.bookTickets({
        attendee_id: user?.id || '22222222-2222-2222-2222-222222222222',
        event_id: event.id,
        items,
        idempotency_key: idempotencyKey,
      });

      setBookingSuccess(true);
      setConfirmedOrderId(result.order_id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Booking failed. Capacity may have shifted.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="paper-card border border-theme p-8 rounded-[2px] space-y-6 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-emerald-400 block">
            Transaction Confirmed
          </span>
          <h3 className="font-mincho text-3xl font-normal text-theme-primary">
            Pass Reserved
          </h3>
          <p className="text-xs font-mincho text-theme-secondary leading-relaxed max-w-sm mx-auto">
            Your admission pass has been registered under <span className="text-theme-primary font-medium">{user?.full_name || 'Guest'}</span>.
            Cryptographic QR ticket generated and row locked.
          </p>
        </div>

        <ScrollLine direction="horizontal" origin="center" />

        <div className="pt-2 flex flex-col gap-3">
          <button
            onClick={() => router.push('/my-tickets')}
            className="w-full py-3.5 px-6 rounded-[50px] bg-theme-primary text-theme-inverse text-xs font-sans uppercase tracking-[0.2em] font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>View Passes in Wallet</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setBookingSuccess(false);
              setQuantities({});
            }}
            className="w-full py-2.5 text-xs font-sans text-theme-tertiary hover:text-theme-primary transition-colors cursor-pointer"
          >
            Book Another Allocation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="paper-card border border-theme p-8 rounded-[2px] space-y-6 shadow-2xl transition-colors duration-300">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-theme pb-4">
        <div>
          <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-theme-tertiary block">
            Reservation Console
          </span>
          <h3 className="font-mincho text-2xl font-normal text-theme-primary mt-0.5">
            Select Passes
          </h3>
        </div>
        <span className="paper-stamp text-[10px] font-sans uppercase tracking-widest px-3 py-1 rounded-[50px]">
          Row Lock Active
        </span>
      </div>

      {/* Ticket Tier Selector */}
      <div className="space-y-4">
        {ticketTypes.map((tier) => {
          const qty = quantities[tier.id] || 0;
          const isSoldOut = tier.remaining_capacity <= 0;

          return (
            <div
              key={tier.id}
              className={`p-4 rounded-[2px] border transition-all ${qty > 0
                  ? 'border-theme-accent bg-theme-subtle'
                  : 'border-theme bg-theme-base'
                } ${isSoldOut ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mincho text-base font-normal text-theme-primary">
                      {tier.name}
                    </span>
                    {tier.remaining_capacity <= 20 && !isSoldOut && (
                      <span className="text-[9px] font-sans uppercase px-2 py-0.5 rounded-[50px] bg-amber-400/20 text-amber-300">
                        {tier.remaining_capacity} left
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-theme-secondary font-mincho line-clamp-1">
                    {tier.description}
                  </p>
                  <span className="font-mincho text-sm font-normal text-theme-primary block pt-1">
                    ₹{(tier.price_cents / 100).toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Stepper Controls */}
                <div className="flex items-center gap-3 shrink-0 pt-1">
                  <button
                    onClick={() => handleQuantityChange(tier.id, -1, tier.remaining_capacity)}
                    disabled={qty === 0}
                    className="w-8 h-8 rounded-full border border-theme flex items-center justify-center text-theme-secondary hover:text-theme-primary hover:border-theme-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label={`Decrease quantity for ${tier.name}`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="font-mono text-sm font-medium text-theme-primary w-4 text-center">
                    {qty}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(tier.id, 1, tier.remaining_capacity)}
                    disabled={qty >= tier.remaining_capacity || qty >= 10}
                    className="w-8 h-8 rounded-full border border-theme flex items-center justify-center text-theme-secondary hover:text-theme-primary hover:border-theme-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    aria-label={`Increase quantity for ${tier.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="p-3.5 rounded-[2px] bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Pricing Summary & Checkout Button */}
      <div className="pt-4 border-t border-theme space-y-4">
        <div className="flex items-center justify-between text-xs font-sans tracking-wider">
          <span className="text-theme-tertiary uppercase">Selected Passes</span>
          <span className="text-theme-primary font-mono">{totalQuantity} passes</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-sans uppercase tracking-[0.2em] text-theme-tertiary">
            Total Amount
          </span>
          <span className="font-mincho text-2xl font-normal text-theme-primary">
            ₹{(totalCents / 100).toLocaleString('en-IN')}
          </span>
        </div>

        <ScrollLine direction="horizontal" origin="center" />

        <button
          onClick={handleBooking}
          disabled={totalQuantity === 0 || isSubmitting}
          className="w-full py-4 px-6 rounded-[50px] bg-theme-primary text-theme-inverse text-xs font-sans uppercase tracking-[0.25em] font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Acquiring Row Lock...</span>
            </>
          ) : (
            <>
              <span>Lock Allocation &amp; Confirm</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-[10px] text-center font-sans tracking-wider text-theme-tertiary">
          Atomic Concurrency Allocation • Immediate Hashed Issuance
        </p>
      </div>
    </div>
  );
}
