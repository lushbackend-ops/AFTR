"use client";

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Event } from '@/types/database';
import { MapPin, Calendar, ArrowUpRight, Sparkles } from 'lucide-react';
import { motion, useScroll, useSpring, useTransform } from 'motion/react';

export function EventCard({ event }: { event: Event }) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Scroll triggers using Lenis viewport tracking
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start 92%", "end 70%"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    restDelta: 0.001,
  });

  // Card entrance motion triggers on scroll
  const cardY = useTransform(smoothProgress, [0, 1], [30, 0]);
  const cardOpacity = useTransform(smoothProgress, [0, 0.4, 1], [0.4, 0.9, 1]);
  const imageScale = useTransform(smoothProgress, [0, 1], [1.08, 1]);

  const lowestPriceCents = event.ticket_types && event.ticket_types.length > 0
    ? Math.min(...event.ticket_types.map((t) => t.price_cents))
    : 0;

  const totalRemaining = event.ticket_types
    ? event.ticket_types.reduce((acc, t) => acc + t.remaining_capacity, 0)
    : event.capacity;

  const isLowCapacity = totalRemaining <= 40;

  const startDate = new Date(event.start_time);
  const formattedDate = startDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
  const formattedTime = startDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata',
  });

  return (
    <motion.div
      ref={cardRef}
      style={{ y: cardY, opacity: cardOpacity }}
      className="h-full relative group"
    >
      {/* Scroll-Reactive Corner Crosshair (Draws on view) */}
      <span className="absolute -top-1.5 -left-1.5 text-theme-tertiary select-none text-xs z-20 pointer-events-none group-hover:text-theme-primary transition-colors">
        +
      </span>
      <span className="absolute -top-1.5 -right-1.5 text-theme-tertiary select-none text-xs z-20 pointer-events-none group-hover:text-theme-primary transition-colors">
        +
      </span>

      <Link
        href={`/events/${event.slug}`}
        className="block h-full rounded-[2px] overflow-hidden paper-card border border-theme hover:border-theme-accent transition-all duration-500 focus:outline-none focus:ring-1 focus:ring-theme-primary flex flex-col justify-between"
      >
        {/* Event Image Banner with Scroll Parallax */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-theme-subtle">
          <motion.div
            style={{ scale: imageScale }}
            className="w-full h-full relative"
          >
            <Image
              src={event.hero_image}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 filter grayscale-[15%] group-hover:grayscale-0"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

          {/* Category Pill */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3.5 py-1 rounded-[50px] text-[10px] font-sans uppercase tracking-[0.2em] bg-black/80 backdrop-blur-md text-white border border-white/20">
              {event.category}
            </span>
          </div>

          {/* Low Capacity Warning Badge */}
          {isLowCapacity && (
            <div className="absolute top-4 right-4 z-10">
              <span className="px-3.5 py-1 rounded-[50px] text-[10px] font-sans uppercase tracking-[0.2em] bg-amber-400 text-black font-semibold shadow-lg">
                {totalRemaining} Left
              </span>
            </div>
          )}

          {/* Bottom overlay: City & Venue */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-2 backdrop-blur-md bg-black/60 px-3 py-1.5 rounded-[2px] border border-white/20">
              <MapPin className="w-3.5 h-3.5 text-white" />
              <span className="font-mincho text-white">{event.city}</span>
              <span className="text-zinc-300 font-sans">• {event.venue_name}</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            {/* Date line */}
            <div className="flex items-center gap-2 text-xs font-sans tracking-wider text-theme-tertiary">
              <Calendar className="w-3.5 h-3.5 text-theme-primary" />
              <span suppressHydrationWarning>{formattedDate}</span>
              <span>•</span>
              <span suppressHydrationWarning>{formattedTime}</span>
            </div>

            {/* Title */}
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-mincho text-2xl font-normal text-theme-primary tracking-wide group-hover:opacity-80 transition-opacity line-clamp-1">
                {event.title}
              </h3>
              <ArrowUpRight className="w-4 h-4 text-theme-tertiary group-hover:text-theme-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0 mt-1" />
            </div>

            {/* Short Description */}
            <p className="text-xs font-mincho text-theme-secondary line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Card Footer with Scroll-Linked Progress Line (Reacts on scroll) */}
          <div className="relative pt-4 mt-4">
            {/* Ambient hairline track */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-theme-border-subtle" />
            
            {/* Dynamic scroll-completing hairline */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-[1.5px] bg-theme-primary origin-left"
              style={{
                scaleX: smoothProgress,
                backgroundColor: "var(--color-line-drawing)",
              }}
            />

            <div className="flex items-center justify-between text-xs pt-2">
              <div>
                <span className="text-[10px] text-theme-tertiary uppercase font-sans tracking-[0.2em] block">
                  Passes From
                </span>
                <span className="font-mincho text-lg font-normal text-theme-primary">
                  ₹{(lowestPriceCents / 100).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-theme-tertiary uppercase font-sans tracking-[0.2em] block">
                  Capacity Locked
                </span>
                <span className="text-xs font-sans tracking-wider text-theme-secondary font-medium">
                  {totalRemaining} / {event.capacity} passes
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
