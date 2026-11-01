"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { ScrollLine } from '@/components/ui/scroll-lines';
import { useLenis } from '@/components/providers/lenis-provider';

export function Footer() {
  const { scrollTo } = useLenis();

  return (
    <footer className="w-full bg-theme-base border-t border-theme py-20 px-6 sm:px-12 mt-auto transition-colors duration-300 relative z-20">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Dynamic scroll-reactive entry line */}
        <ScrollLine direction="horizontal" origin="center" className="mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand & Manifesto */}
          <div className="md:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="font-mincho text-3xl tracking-[0.25em] text-theme-primary uppercase font-normal">
                AFTR
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-theme-primary opacity-60" />
              <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-theme-tertiary">
                Nocturnal Sound Architecture
              </span>
            </div>
            <p className="text-sm font-mincho text-theme-secondary max-w-lg leading-relaxed">
              AFTR is an exclusive platform dedicated to curated nocturnal sound sanctuaries, underground acoustics, and cultural gatherings. Powered by atomic concurrency engines to ensure deterministic ticketing with zero overselling.
            </p>
            <div className="flex items-center gap-3 text-xs font-sans tracking-widest text-theme-tertiary pt-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Atomic Concurrency • Deterministic Allocation • Camera Verification Ready</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3 space-y-4">
            <p className="text-xs font-sans uppercase tracking-[0.25em] text-theme-tertiary">
              Curated Gatherings
            </p>
            <ul className="space-y-2.5 text-sm font-mincho text-theme-secondary">
              <li>
                <Link href="/events" className="hover:text-theme-primary transition-colors">
                  All Gatherings
                </Link>
              </li>
              <li>
                <Link href="/my-tickets" className="hover:text-theme-primary transition-colors">
                  My Digital Passes
                </Link>
              </li>
              <li>
                <Link href="/events/magnetic-fields-desert-sanctuary" className="hover:text-theme-primary transition-colors">
                  Flagship: Magnetic Fields Rajasthan
                </Link>
              </li>
            </ul>
          </div>

          {/* Organiser Tools */}
          <div className="md:col-span-3 space-y-4">
            <p className="text-xs font-sans uppercase tracking-[0.25em] text-theme-tertiary">
              Door & System
            </p>
            <ul className="space-y-2.5 text-sm font-mincho text-theme-secondary">
              <li>
                <Link href="/organiser" className="hover:text-theme-primary transition-colors">
                  Organiser Hub
                </Link>
              </li>
              <li>
                <Link href="/organiser/events/new" className="hover:text-theme-primary transition-colors">
                  Create Gathering
                </Link>
              </li>
              <li>
                <Link href="/organiser/check-in" className="hover:text-theme-primary transition-colors">
                  Door Scanner
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-theme-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans tracking-wider text-theme-tertiary">
          <p suppressHydrationWarning>© {new Date().getFullYear()} AFTR Collective. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => scrollTo(0, { duration: 1.2 })}
              className="flex items-center gap-2 hover:text-theme-primary transition-colors cursor-pointer focus:outline-none"
              aria-label="Return to top"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <span className="hidden sm:inline opacity-40">•</span>
            <span>Zen Old Mincho</span>
            <span>Adaptive Theme Engine</span>
            <span>SHA-256 Hashed Passes</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
