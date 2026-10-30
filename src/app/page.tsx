"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { useLenis } from "@/components/providers/lenis-provider";
import { EventCard } from "@/components/events/event-card";
import { ScrollLine, SectionScrollDivider } from "@/components/ui/scroll-lines";
import { aftrStore } from "@/lib/services/mock-store";
import {
  Calendar,
  MapPin,
  ShieldCheck,
  QrCode,
  ArrowUpRight,
  ChevronDown,
  Lock,
  Layers,
  Sparkles,
  Ticket,
} from "lucide-react";

export default function HomePage() {
  const { scrollTo } = useLenis();
  const allEvents = aftrStore.getEvents();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    "Heritage & Electronic",
    "Eco-Acoustic & Electronic",
    "Coastal & Underground",
    "Jazz & Indian Classical",
  ];

  const filteredEvents =
    selectedCategory === "All"
      ? allEvents
      : allEvents.filter((ev) => ev.category === selectedCategory);

  const featuredEvent = allEvents[0]; // Magnetic Fields

  const handleScrollToSection = (id: string) => {
    scrollTo(id, { offset: -70, duration: 1.2 });
  };

  return (
    <div className="bg-theme-base text-theme-primary min-h-screen font-mincho transition-colors duration-300">
      {/* ========================================================= */}
      {/* 1. HERO SECTION (Indian Cultural Gatherings + Scroll Lines) */}
      {/* ========================================================= */}
      <section className="relative min-h-[92vh] flex flex-col justify-between pt-16 pb-12 px-6 sm:px-12 max-w-7xl mx-auto">
        {/* Top Status & Framing Meta */}
        <div className="space-y-4 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-sans tracking-[0.25em] text-theme-tertiary uppercase pb-2 w-full">
            <div className="flex items-center gap-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>AFTR INDIA • SACRED SOUND SANCTUARIES 2026-27</span>
            </div>
            <div className="flex items-center gap-6 text-[11px]">
              <span>RAJASTHAN / GOA / BENGALURU / MUMBAI / DELHI</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline">ROW-LOCK CONCURRENCY</span>
            </div>
          </div>

          {/* Scroll-Reactive Header Line */}
          <ScrollLine direction="horizontal" origin="left" />
        </div>

        {/* Hero Body: Asymmetrical Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center my-auto py-12">
          {/* Left Text Column */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-8 text-left"
          >
            <div className="space-y-3">
              <span className="font-sans text-xs tracking-[0.35em] uppercase text-theme-tertiary block">
                Curated Nocturnal Acoustics • Sacred Indian Sanctuaries
              </span>
              <p className="text-sm font-sans tracking-[0.2em] text-theme-secondary uppercase">
                Anti-Overselling Concurrency Ticketing
              </p>
            </div>

            <div className="space-y-4">
              <h1 className="font-mincho text-5xl sm:text-7xl lg:text-8xl tracking-tight leading-[1.08] text-theme-primary">
                Sacred Sound.
                <br />
                Velvet Nights.
              </h1>
              <p className="font-mincho text-base sm:text-lg text-theme-secondary tracking-wider leading-relaxed pt-3 max-w-xl">
                From 17th-century palace courtyards to Goa&apos;s sea cliffs and Bengaluru&apos;s bamboo groves. Curated cultural gatherings with zero-oversell deterministic pass issuance.
              </p>
            </div>

            {/* Micro Details & Action Buttons */}
            <div className="pt-6 border-t border-theme flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleScrollToSection("#gatherings")}
                className="px-8 py-3.5 rounded-[50px] text-xs font-sans tracking-[0.25em] uppercase bg-theme-primary text-theme-inverse font-medium hover:opacity-90 transition-all duration-300 shadow-sm cursor-pointer"
              >
                Explore Gatherings
              </button>
              <button
                onClick={() => handleScrollToSection("#concurrency")}
                className="px-8 py-3.5 rounded-[50px] text-xs font-sans tracking-[0.25em] uppercase border border-theme text-theme-primary hover:border-theme-accent transition-all duration-300 cursor-pointer"
              >
                Zero-Oversell Engine
              </button>
              <Link
                href="/my-tickets"
                className="px-6 py-3.5 rounded-[50px] text-xs font-sans tracking-[0.25em] uppercase text-theme-tertiary hover:text-theme-primary transition-colors"
              >
                My Passes →
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Featured Gathering Card in Minimalist Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            {/* Vertical Accent Banner */}
            <div className="hidden sm:block absolute -right-6 top-8 z-20 pointer-events-none">
              <span className="writing-vertical-rl text-orientation-upright font-sans text-[10px] tracking-[0.35em] uppercase text-theme-tertiary bg-theme-card/90 backdrop-blur-sm py-4 px-2 border border-theme shadow-md">
                PALACE SANCTUARY
              </span>
            </div>

            {/* Featured Event Card Preview */}
            <div className="bg-theme-card border border-theme p-6 rounded-[2px] space-y-5 shadow-xl">
              <div className="flex items-center justify-between text-xs font-sans tracking-widest text-theme-tertiary uppercase border-b border-theme pb-3">
                <span>Featured Gathering</span>
                <span className="text-theme-primary font-medium">№ 01</span>
              </div>

              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px] border border-theme">
                <Image
                  src={featuredEvent.hero_image}
                  alt={featuredEvent.title}
                  fill
                  priority
                  className="object-cover filter grayscale-[15%] hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs">
                  <span className="px-3.5 py-1 rounded-[50px] text-[10px] uppercase font-sans tracking-widest bg-black/80 backdrop-blur-md text-white border border-white/20">
                    {featuredEvent.city} • {featuredEvent.venue_name}
                  </span>
                  <span className="px-3.5 py-1 rounded-[50px] text-[10px] uppercase font-sans tracking-widest bg-amber-400 text-black font-semibold">
                    Palace Allocation
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="font-mincho text-2xl text-theme-primary font-normal leading-snug">
                  {featuredEvent.title}
                </h2>
                <p className="text-xs font-mincho text-theme-secondary line-clamp-2 leading-relaxed">
                  {featuredEvent.description}
                </p>
              </div>

              {/* Scroll Line in Card */}
              <ScrollLine direction="horizontal" origin="center" />

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-theme-tertiary font-sans uppercase tracking-[0.2em] block">
                    Passes From
                  </span>
                  <span className="font-mincho text-xl text-theme-primary">
                    ₹{((featuredEvent?.ticket_types?.[0]?.price_cents || 950000) / 100).toLocaleString('en-IN')}
                  </span>
                </div>
                <Link
                  href={`/events/${featuredEvent.slug}`}
                  className="px-6 py-2.5 rounded-[50px] text-xs font-sans tracking-[0.2em] uppercase bg-theme-primary text-theme-inverse font-medium hover:opacity-90 transition-all shadow-sm"
                >
                  Reserve Pass
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Cue */}
        <div className="space-y-4">
          <ScrollLine direction="horizontal" origin="right" />
          <div className="flex items-center justify-between text-xs font-sans tracking-[0.25em] text-theme-tertiary uppercase pt-2">
            <span>01 / GATHERINGS</span>
            <button
              onClick={() => handleScrollToSection("#gatherings")}
              className="flex items-center gap-2 hover:text-theme-primary transition-colors focus:outline-none cursor-pointer"
            >
              <span>Scroll to explore</span>
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </button>
            <span>CONCURRENCY LOCKED</span>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 2. CURATED GATHERINGS DIRECTORY (#gatherings)             */}
      {/* ========================================================= */}
      <section
        id="gatherings"
        className="py-24 px-6 sm:px-12 max-w-7xl mx-auto"
      >
        {/* Scroll-Reactive Section Divider */}
        <SectionScrollDivider number="01" label="CURATED SANCTUARIES • INDIAN GATHERINGS" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 pt-8">
          <div className="space-y-4">
            <h2 className="font-mincho text-4xl sm:text-5xl text-theme-primary font-normal">
              Flagship Engagements
            </h2>
            <p className="font-mincho text-sm text-theme-secondary max-w-xl">
              Handpicked boutique gatherings across Rajasthan&apos;s desert palaces, Goa&apos;s cliffside acoustics, and Bengaluru&apos;s forest amphitheatres.
            </p>
          </div>

          {/* Minimalist Category Tabs with 50px pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-[50px] text-xs font-sans tracking-wider transition-all duration-300 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-theme-primary text-theme-inverse font-medium shadow-sm"
                    : "border border-theme text-theme-secondary hover:text-theme-primary hover:border-theme-accent"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic separator line */}
        <ScrollLine direction="horizontal" origin="center" className="mb-12" />

        {/* Events Grid with Scroll Triggers on Card Elements */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>

      {/* ========================================================= */}
      {/* 3. CONCURRENCY ARCHITECTURE & ZERO-OVERSELL (#concurrency) */}
      {/* ========================================================= */}
      <section
        id="concurrency"
        className="py-24 px-6 sm:px-12 max-w-7xl mx-auto bg-theme-subtle/40 transition-colors duration-300"
      >
        <SectionScrollDivider number="02" label="CONCURRENCY ENGINE • ROW-LEVEL MUTEX" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8">
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-sans tracking-[0.3em] uppercase text-theme-tertiary">
                Deterministic Allocation Architecture
              </span>
            </div>

            <h2 className="font-mincho text-3xl sm:text-5xl text-theme-primary font-normal leading-tight">
              Row-Level Locks.
              <br />
              Zero Overselling.
            </h2>

            <p className="font-mincho text-sm sm:text-base text-theme-secondary leading-relaxed">
              Eliminate post-payment cancellations and double-booking errors common during high-demand festival drops.
              PostgreSQL <code className="text-xs bg-theme-card px-2 py-1 border border-theme text-theme-primary font-mono">SELECT ... FOR UPDATE</code> row-level locks
              guarantee strict inventory integrity under millisecond concurrent access.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-5 rounded-[2px] bg-theme-card border border-theme space-y-2">
                <div className="flex items-center gap-2 text-theme-primary">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-sans tracking-widest uppercase">Atomic Mutex</span>
                </div>
                <p className="text-xs font-mincho text-theme-secondary">
                  Concurrent booking requests are queued and held in exclusive locks until inventory counts are safely decremented.
                </p>
                <ScrollLine direction="horizontal" origin="left" className="pt-1" />
              </div>

              <div className="p-5 rounded-[2px] bg-theme-card border border-theme space-y-2">
                <div className="flex items-center gap-2 text-theme-primary">
                  <QrCode className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-sans tracking-widest uppercase">SHA-256 Hashing</span>
                </div>
                <p className="text-xs font-mincho text-theme-secondary">
                  Every digital entry pass is cryptographically hashed with SHA-256, rendering forgery and duplicate entry impossible.
                </p>
                <ScrollLine direction="horizontal" origin="left" className="pt-1" />
              </div>
            </div>
          </div>

          {/* Interactive Concurrency Status Visualizer */}
          <div className="lg:col-span-6 bg-theme-card border border-theme p-8 rounded-[2px] space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-theme pb-4">
              <span className="text-xs font-sans tracking-[0.25em] uppercase text-theme-tertiary">
                Real-Time Concurrency State
              </span>
              <span className="text-xs font-sans text-emerald-400 tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Protection
              </span>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between p-3 bg-theme-subtle border border-theme rounded-[2px]">
                <span className="text-theme-tertiary">ISOLATION_LEVEL</span>
                <span className="text-theme-primary">SERIALIZABLE / REPEATABLE READ</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-theme-subtle border border-theme rounded-[2px]">
                <span className="text-theme-tertiary">MUTEX_ACQUISITION_LATENCY</span>
                <span className="text-emerald-400">&lt; 3.8ms</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-theme-subtle border border-theme rounded-[2px]">
                <span className="text-theme-tertiary">OVERSELL_INCIDENT_RATE</span>
                <span className="text-theme-primary">0.000% (Guaranteed)</span>
              </div>
            </div>

            {/* Scroll-reactive gauge line */}
            <ScrollLine direction="horizontal" origin="center" />

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans tracking-wider text-theme-tertiary">
              <span>Camera Verification Ready</span>
              <Link
                href="/organiser/check-in"
                className="px-5 py-2.5 rounded-[50px] border border-theme hover:border-theme-accent text-theme-primary transition-all uppercase text-[11px] tracking-[0.2em]"
              >
                Test Door Scanner →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 4. DIGITAL PASS EXPERIENCE (#passes)                       */}
      {/* ========================================================= */}
      <section
        id="passes"
        className="py-24 px-6 sm:px-12 max-w-7xl mx-auto"
      >
        <SectionScrollDivider number="03" label="DIGITAL PASSES • ACCESS CONTROL" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8">
          {/* Left: Tactile Digital Pass Card */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="bg-theme-card border border-theme p-8 rounded-[2px] relative overflow-hidden space-y-6 shadow-2xl">
              {/* Top Pass Details */}
              <div className="flex items-center justify-between border-b border-theme pb-4">
                <div>
                  <span className="text-[10px] font-sans tracking-[0.3em] uppercase text-theme-tertiary block">
                    Digital Pass • Verified Entry
                  </span>
                  <span className="font-mincho text-xl text-theme-primary">Magnetic Fields</span>
                </div>
                <span className="px-3.5 py-1 rounded-[50px] text-[10px] font-sans uppercase tracking-widest bg-theme-primary text-theme-inverse font-medium">
                  Confirmed
                </span>
              </div>

              {/* Middle Pass Metadata */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans tracking-wider">
                <div>
                  <span className="text-theme-tertiary uppercase text-[10px] block">Attendee</span>
                  <span className="font-mincho text-theme-primary text-sm">Rhea Kapoor</span>
                </div>
                <div>
                  <span className="text-theme-tertiary uppercase text-[10px] block">Tier</span>
                  <span className="text-theme-primary">Desert Oasis Pass</span>
                </div>
                <div>
                  <span className="text-theme-tertiary uppercase text-[10px] block">Date</span>
                  <span className="text-theme-primary">Dec 18, 2026</span>
                </div>
                <div>
                  <span className="text-theme-tertiary uppercase text-[10px] block">Pass Hash</span>
                  <span className="text-emerald-500 font-mono text-[10px]">#AFTR-IN-9942</span>
                </div>
              </div>

              {/* Perforation Divider with Scroll-Line */}
              <div className="relative py-2 flex items-center justify-between">
                <div className="w-full">
                  <ScrollLine direction="horizontal" origin="center" />
                </div>
              </div>

              {/* QR Code Matrix Area */}
              <div className="flex flex-col items-center justify-center p-6 bg-theme-subtle border border-theme rounded-[2px] space-y-3">
                <QrCode className="w-24 h-24 text-theme-primary stroke-[1.2]" />
                <span className="font-mono text-[10px] text-theme-tertiary tracking-[0.25em]">
                  SCAN AT PALACE GATE • DO NOT SHARE
                </span>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-sans text-theme-tertiary">
                <span>Apple Wallet Ready</span>
                <Link
                  href="/my-tickets"
                  className="text-theme-primary hover:underline underline-offset-4 tracking-wider"
                >
                  Manage Passes →
                </Link>
              </div>
            </div>
          </div>

          {/* Right: Pass Engine Narrative */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <span className="text-xs font-sans tracking-[0.3em] uppercase text-theme-tertiary block">
              Frictionless Entry • Instant Verification
            </span>
            <h2 className="font-mincho text-3xl sm:text-5xl text-theme-primary font-normal leading-tight">
              Tactile Passes.
              <br />
              Instant Camera Verification.
            </h2>
            <p className="font-mincho text-sm sm:text-base text-theme-secondary leading-relaxed">
              High-resolution QR passes generated instantaneously upon purchase.
              Present smoothly on your mobile screen with ultra-low latency organiser synchronization for sub-second gate check-ins.
            </p>

            <ScrollLine direction="horizontal" origin="left" className="my-4" />

            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                href="/my-tickets"
                className="px-8 py-3.5 rounded-[50px] text-xs font-sans tracking-[0.25em] uppercase bg-theme-primary text-theme-inverse font-medium hover:opacity-90 transition-all duration-300"
              >
                View My Passes
              </Link>
              <Link
                href="/organiser/check-in"
                className="px-8 py-3.5 rounded-[50px] text-xs font-sans tracking-[0.25em] uppercase border border-theme text-theme-primary hover:border-theme-accent transition-all duration-300"
              >
                Door Scanner View
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5. ORGANISER PORTAL CTA                                    */}
      {/* ========================================================= */}
      <section className="py-24 px-6 sm:px-12 max-w-7xl mx-auto">
        <SectionScrollDivider number="04" label="ORGANISER HUB • PRODUCTION SUITE" />

        <div className="mt-8 border border-theme p-10 sm:p-16 rounded-[2px] bg-theme-card text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-sans tracking-[0.35em] uppercase text-theme-tertiary block">
              For Curators & Festival Directors
            </span>
            <h2 className="font-mincho text-3xl sm:text-5xl text-theme-primary font-normal">
              Host High-Consequence Indian Gatherings
            </h2>
            <p className="font-mincho text-sm text-theme-secondary leading-relaxed">
              Historic palaces, ancient forests, and coastal cultural sanctuaries. Host and manage high-consequence ticketing with live capacity telemetry, instant door scanners, and deterministic allocations.
            </p>
          </div>

          <ScrollLine direction="horizontal" origin="center" className="max-w-md mx-auto my-4" />

          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link
              href="/organiser"
              className="px-8 py-3.5 rounded-[50px] text-xs font-sans tracking-[0.25em] uppercase bg-theme-primary text-theme-inverse font-medium hover:opacity-90 transition-all duration-300"
            >
              Organiser Dashboard
            </Link>
            <Link
              href="/organiser/events/new"
              className="px-8 py-3.5 rounded-[50px] text-xs font-sans tracking-[0.25em] uppercase border border-theme text-theme-primary hover:border-theme-accent transition-all duration-300"
            >
              Publish Gathering
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
