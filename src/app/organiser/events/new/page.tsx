"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { aftrStore } from '@/lib/services/mock-store';
import { ScrollLine } from '@/components/ui/scroll-lines';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Calendar,
  MapPin,
  Sparkles,
  Loader2,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';

interface TicketTierInput {
  name: string;
  price_cents: number;
  total_capacity: number;
  description: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const { user, isOrganiser, quickSwitch } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Heritage & Electronic');
  const [description, setDescription] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [city, setCity] = useState('Rajasthan');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [heroImage, setHeroImage] = useState('/images/events/techno-warehouse.jpg');
  const [capacity, setCapacity] = useState(300);

  const [ticketTiers, setTicketTiers] = useState<TicketTierInput[]>([
    {
      name: 'General Admission Tier I',
      price_cents: 450000,
      total_capacity: 200,
      description: 'Standard admission, access to primary courtyard acoustic stage',
    },
    {
      name: 'Patron & Balcony Access',
      price_cents: 950000,
      total_capacity: 100,
      description: 'Private terrace viewing, dedicated listening lounge, concierge bar',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddTier = () => {
    setTicketTiers((prev) => [
      ...prev,
      {
        name: `VIP Oasis Tier ${prev.length + 1}`,
        price_cents: 750000,
        total_capacity: 50,
        description: 'Priority gate entry and exclusive acoustic pavilion access',
      },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    if (ticketTiers.length <= 1) return;
    setTicketTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTierChange = (
    index: number,
    field: keyof TicketTierInput,
    value: string | number
  ) => {
    setTicketTiers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !venueName || !city || !startTime || !endTime) {
      setError('Please fill in all required event details');
      return;
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const totalTierCapacity = ticketTiers.reduce((acc, t) => acc + Number(t.total_capacity), 0);
    const finalCapacity = Math.max(Number(capacity), totalTierCapacity);

    setIsSubmitting(true);

    try {
      const newEvent = aftrStore.createEvent(
        {
          organiser_id: user?.id || '11111111-1111-1111-1111-111111111111',
          title,
          slug,
          category,
          description: description || 'Curated AFTR nocturnal cultural sanctuary.',
          venue_name: venueName,
          venue_address: venueAddress || venueName,
          city,
          start_time: new Date(startTime).toISOString(),
          end_time: new Date(endTime).toISOString(),
          hero_image: heroImage,
          capacity: finalCapacity,
          status: 'published',
        },
        ticketTiers.map((t) => ({
          name: t.name,
          description: t.description,
          price_cents: Number(t.price_cents),
          total_capacity: Number(t.total_capacity),
          remaining_capacity: Number(t.total_capacity),
          sale_start: '2026-10-01T00:00:00.000Z',
          sale_end: new Date(endTime).toISOString(),
        }))
      );

      // Navigate to the newly created event directly in the operational dashboard
      router.push(`/organiser?event_id=${newEvent.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error creating gathering';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-theme-base text-theme-primary min-h-screen font-mincho py-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-6 sm:px-12 space-y-8">
        {/* Organiser Banner if in Attendee Mode */}
        {!isOrganiser && (
          <div className="p-5 rounded-[2px] bg-theme-card border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-sans uppercase tracking-wider text-theme-primary font-semibold">
                  Attendee Session Active
                </p>
                <p className="text-xs font-mincho text-theme-secondary">
                  You are publishing as Arjun Mehta (Organiser). Click to switch role.
                </p>
              </div>
            </div>
            <button
              onClick={() => quickSwitch('organiser')}
              className="px-6 py-2.5 rounded-[50px] bg-theme-primary text-theme-inverse text-xs font-sans uppercase tracking-[0.2em] font-medium hover:opacity-90 transition-opacity shrink-0 cursor-pointer shadow-sm"
            >
              Switch to Organiser (Arjun Mehta)
            </button>
          </div>
        )}

        {/* Top Nav */}
        <div className="flex items-center justify-between pb-4 border-b border-theme">
          <Link
            href="/organiser/events"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[50px] text-xs font-sans uppercase tracking-widest bg-theme-card hover:bg-theme-subtle text-theme-secondary hover:text-theme-primary border border-theme transition-colors shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Gatherings</span>
          </Link>
          <span className="text-xs font-sans uppercase tracking-[0.2em] text-theme-tertiary">
            New Gathering Curation
          </span>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <span className="text-[10px] font-sans uppercase tracking-[0.3em] text-theme-tertiary block">
            Event Publication &amp; Inventory Locks
          </span>
          <h1 className="font-mincho text-3xl sm:text-5xl font-normal text-theme-primary tracking-tight">
            Curate a New Gathering
          </h1>
          <p className="text-sm font-mincho text-theme-secondary leading-relaxed">
            Define venue architecture, acoustic discipline, and allocate ticket tiers protected by atomic concurrency allocation.
          </p>
        </div>

        <ScrollLine direction="horizontal" origin="left" />

        {error && (
          <div className="p-4 rounded-[2px] bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs font-sans">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Core Details */}
          <div className="bg-theme-card p-6 sm:p-8 rounded-[2px] border border-theme space-y-6 shadow-xl">
            <h2 className="font-mincho text-2xl font-normal text-theme-primary">
              1. Event Architecture
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-sans uppercase tracking-wider text-theme-tertiary">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SOMA: Quadraphonic Desert Sanctuary"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-subtle border border-theme rounded-[2px] text-sm text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-theme-accent transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans uppercase tracking-wider text-theme-tertiary">
                  Discipline / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-subtle border border-theme rounded-[2px] text-sm text-theme-primary focus:outline-none focus:border-theme-accent transition-colors cursor-pointer"
                >
                  <option value="Heritage & Electronic" className="bg-theme-card text-theme-primary">
                    Heritage &amp; Electronic
                  </option>
                  <option value="Eco-Acoustic & Electronic" className="bg-theme-card text-theme-primary">
                    Eco-Acoustic &amp; Electronic
                  </option>
                  <option value="Coastal & Underground" className="bg-theme-card text-theme-primary">
                    Coastal &amp; Underground
                  </option>
                  <option value="Jazz & Indian Classical" className="bg-theme-card text-theme-primary">
                    Jazz &amp; Indian Classical
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans uppercase tracking-wider text-theme-tertiary">
                  City / Region *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rajasthan, Goa, Bengaluru, Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-subtle border border-theme rounded-[2px] text-sm text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-theme-accent transition-colors"
                />
              </div>

              <div className="sm:col-span-2 space-y-2">
                <label className="text-xs font-sans uppercase tracking-wider text-theme-tertiary">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Atmosphere, acoustic design, artist confluences, and sanctuary ethos..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-subtle border border-theme rounded-[2px] text-sm text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-theme-accent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Venue & Schedule */}
          <div className="bg-theme-card p-6 sm:p-8 rounded-[2px] border border-theme space-y-6 shadow-xl">
            <h2 className="font-mincho text-2xl font-normal text-theme-primary">
              2. Venue &amp; Schedule
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-sans uppercase tracking-wider text-theme-tertiary">
                  Venue Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alsisar Mahal Palace"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-subtle border border-theme rounded-[2px] text-sm text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-theme-accent transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans uppercase tracking-wider text-theme-tertiary">
                  Venue Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alsisar Village, Jhunjhunu"
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-subtle border border-theme rounded-[2px] text-sm text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-theme-accent transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans uppercase tracking-wider text-theme-tertiary">
                  Start Date &amp; Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-subtle border border-theme rounded-[2px] text-sm text-theme-primary focus:outline-none focus:border-theme-accent transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-sans uppercase tracking-wider text-theme-tertiary">
                  End Date &amp; Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 bg-theme-subtle border border-theme rounded-[2px] text-sm text-theme-primary focus:outline-none focus:border-theme-accent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Capacity & Ticket Tiers */}
          <div className="bg-theme-card p-6 sm:p-8 rounded-[2px] border border-theme space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-mincho text-2xl font-normal text-theme-primary">
                  3. Ticket Tiers &amp; Allocation
                </h2>
                <p className="text-xs font-sans text-theme-tertiary mt-0.5">
                  Concurrency locks guarantee zero overselling past tier capacity
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddTier}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[50px] text-xs font-sans uppercase tracking-wider border border-theme hover:border-theme-accent text-theme-primary transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tier</span>
              </button>
            </div>

            <div className="space-y-4">
              {ticketTiers.map((tier, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-[2px] bg-theme-subtle border border-theme space-y-4 relative shadow-sm"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                    <div className="sm:col-span-5 space-y-1">
                      <label className="text-[10px] font-sans uppercase text-theme-tertiary tracking-wider">
                        Tier Name
                      </label>
                      <input
                        type="text"
                        required
                        value={tier.name}
                        onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-theme-card border border-theme rounded-[2px] text-xs font-sans text-theme-primary focus:outline-none focus:border-theme-accent"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-sans uppercase text-theme-tertiary tracking-wider">
                        Price (₹ INR)
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="100"
                        value={tier.price_cents / 100}
                        onChange={(e) =>
                          handleTierChange(
                            idx,
                            'price_cents',
                            Math.round(Number(e.target.value) * 100)
                          )
                        }
                        className="w-full px-3 py-2 bg-theme-card border border-theme rounded-[2px] text-xs font-mono text-theme-primary focus:outline-none focus:border-theme-accent"
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-sans uppercase text-theme-tertiary tracking-wider">
                        Capacity
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={tier.total_capacity}
                        onChange={(e) =>
                          handleTierChange(idx, 'total_capacity', Number(e.target.value))
                        }
                        className="w-full px-3 py-2 bg-theme-card border border-theme rounded-[2px] text-xs font-mono text-theme-primary focus:outline-none focus:border-theme-accent"
                      />
                    </div>

                    <div className="sm:col-span-1 flex justify-end pt-5 sm:pt-0">
                      {ticketTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(idx)}
                          className="p-2 text-theme-tertiary hover:text-red-400 transition-colors cursor-pointer"
                          title="Remove tier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-sans uppercase text-theme-tertiary tracking-wider">
                      Tier Inclusions &amp; Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Full weekend palace courtyard access..."
                      value={tier.description}
                      onChange={(e) => handleTierChange(idx, 'description', e.target.value)}
                      className="w-full px-3 py-2 bg-theme-card border border-theme rounded-[2px] text-xs font-sans text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-theme-accent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-4 flex items-center justify-between border-t border-theme">
            <Link
              href="/organiser/events"
              className="text-xs font-sans uppercase tracking-widest text-theme-tertiary hover:text-theme-primary transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-3.5 rounded-[50px] bg-theme-primary text-theme-inverse text-xs font-sans uppercase tracking-[0.25em] font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Publishing Gathering...</span>
                </>
              ) : (
                <span>Publish Gathering &amp; Open Sales</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
