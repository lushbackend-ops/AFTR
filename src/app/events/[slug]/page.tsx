import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { aftrStore } from '@/lib/services/mock-store';
import { BookingWidget } from '@/components/events/booking-widget';
import { ScrollLine, SectionScrollDivider } from '@/components/ui/scroll-lines';
import { Calendar, MapPin, Clock, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = aftrStore.getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);

  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const formattedTime = `${startDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })} – ${endDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })}`;

  return (
    <div className="bg-theme-base text-theme-primary min-h-screen font-mincho pb-32 space-y-12 transition-colors duration-300">
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[55vh] flex flex-col justify-end pt-24 pb-12 px-6 sm:px-12 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-theme-base">
          <Image
            src={event.hero_image}
            alt={event.title}
            fill
            priority
            className="object-cover opacity-40 filter contrast-125 dark:brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-theme-base via-theme-base/70 to-transparent" />
        </div>

        <div className="w-full space-y-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-5 py-2 rounded-[50px] text-xs font-sans tracking-widest uppercase bg-theme-card/80 hover:bg-theme-card text-theme-secondary border border-theme transition-all duration-300 backdrop-blur-md w-fit"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Curation</span>
          </Link>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-[50px] text-[10px] font-sans uppercase tracking-widest bg-theme-primary text-theme-inverse font-medium">
                {event.category}
              </span>
              <span className="px-3.5 py-1 rounded-[50px] text-[10px] font-sans uppercase tracking-widest bg-theme-card border border-theme text-theme-secondary">
                {event.city}
              </span>
            </div>

            <h1 className="font-mincho text-4xl sm:text-6xl md:text-7xl font-normal text-theme-primary tracking-tight leading-[1.08]">
              {event.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-theme-secondary font-sans tracking-wider pt-4 border-t border-theme">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-theme-primary" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-theme-primary" />
              <span>{formattedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-theme-primary" />
              <span>{event.venue_name}, {event.city}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll-Reactive Header Divider */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <ScrollLine direction="horizontal" origin="left" />
      </div>

      {/* Main Content Layout: 2 Columns */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Narrative & Event Specs (7 cols) */}
          <div className="lg:col-span-7 space-y-12">
            {/* Curatorial Statement */}
            <div className="space-y-6">
              <SectionScrollDivider number="01" label="CURATORIAL ARCHITECTURE" />
              <h2 className="font-mincho text-3xl font-normal text-theme-primary">
                About the Gathering
              </h2>
              <div className="text-theme-secondary text-base leading-relaxed whitespace-pre-line space-y-4 font-normal">
                {event.description}
              </div>
            </div>

            {/* Experience Architecture */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-theme-card p-6 rounded-[2px] border border-theme space-y-3 shadow-md">
                <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-theme-tertiary block">
                  Acoustic Engineering
                </span>
                <h4 className="text-theme-primary font-normal text-lg font-mincho">Custom Quadraphonic Array</h4>
                <p className="text-xs text-theme-secondary leading-relaxed">
                  Tuned specifically to the raw industrial volume of the venue for distortion-free spatial acoustic immersion.
                </p>
                <ScrollLine direction="horizontal" origin="left" className="pt-2" />
              </div>

              <div className="bg-theme-card p-6 rounded-[2px] border border-theme space-y-3 shadow-md">
                <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-theme-tertiary block">
                  Security Protocol
                </span>
                <h4 className="text-theme-primary font-normal text-lg font-mincho">Encrypted SHA-256 Passes</h4>
                <p className="text-xs text-theme-secondary leading-relaxed">
                  Single-scan admission pass stored securely in your AFTR wallet with sub-millisecond door verification integrity.
                </p>
                <ScrollLine direction="horizontal" origin="left" className="pt-2" />
              </div>
            </div>

            {/* Venue & Location Specs */}
            <div className="bg-theme-card p-8 rounded-[2px] border border-theme space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-theme pb-4">
                <div>
                  <span className="text-[10px] font-sans uppercase tracking-[0.25em] text-theme-tertiary">Venue Specifications</span>
                  <h3 className="font-mincho text-2xl font-normal text-theme-primary mt-1">{event.venue_name}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-theme-subtle flex items-center justify-center border border-theme">
                  <MapPin className="w-4 h-4 text-theme-primary" />
                </div>
              </div>

              <div className="space-y-1 text-xs font-sans tracking-wider text-theme-secondary">
                <p>{event.venue_address}</p>
                <p>{event.city}</p>
              </div>

              <div className="pt-4 border-t border-theme-subtle flex flex-wrap gap-4 text-xs font-sans tracking-wider text-theme-tertiary">
                <div>Capacity: <span className="text-theme-primary">{event.capacity} Attendees</span></div>
                <div>•</div>
                <div>Age: <span className="text-theme-primary">Strictly 21+</span></div>
                <div>•</div>
                <div>Dress: <span className="text-theme-primary">Nocturnal Elegance</span></div>
              </div>
            </div>

            {/* Door Policy & Ethics */}
            <div className="p-6 rounded-[2px] bg-theme-subtle border border-theme space-y-3">
              <div className="flex items-center gap-2 text-theme-primary font-medium text-xs font-sans tracking-wider uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Door Etiquette & Safe Space Policy</span>
              </div>
              <p className="text-xs text-theme-secondary leading-relaxed font-mincho">
                AFTR maintains zero tolerance for harassment, unauthorized photography on the floor, or non-consensual behavior. Possession of a valid QR pass does not override door discretion regarding safety.
              </p>
            </div>
          </div>

          {/* Right Column: Sticky Booking Widget (5 cols) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <BookingWidget event={event} />

            {/* Guaranteed Authenticity Callout */}
            <div className="bg-theme-card p-6 rounded-[2px] border border-theme flex items-center gap-4 shadow-lg">
              <div className="w-10 h-10 rounded-full bg-theme-subtle flex items-center justify-center text-theme-primary border border-theme shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-xs font-medium text-theme-primary font-sans uppercase tracking-wider">AFTR Anti-Scalp Guarantee</h5>
                <p className="text-xs text-theme-secondary font-mincho mt-0.5">
                  Dynamic row-level lock concurrency prevents overselling, duplicate tickets, and secondary price gouging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
