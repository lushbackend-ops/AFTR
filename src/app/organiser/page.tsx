import React from 'react';
import Link from 'next/link';
import { DashboardView } from '@/components/dashboard/dashboard-view';
import { ScrollLine, SectionScrollDivider } from '@/components/ui/scroll-lines';
import { Plus } from 'lucide-react';

export default function OrganiserDashboardPage() {
  return (
    <div className="bg-theme-base text-theme-primary min-h-screen font-mincho py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 space-y-8">
        {/* Secondary Quick Nav Bar for Organiser Hub with wed.md tokens */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[2px] bg-theme-card border border-theme shadow-md">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/organiser"
              className="px-5 py-2 rounded-[50px] text-xs font-sans tracking-wider uppercase font-medium bg-theme-primary text-theme-inverse shadow-sm"
            >
              Analytics &amp; Door
            </Link>
            <Link
              href="/organiser/events"
              className="px-5 py-2 rounded-[50px] text-xs font-sans tracking-wider uppercase text-theme-secondary hover:text-theme-primary transition-colors border border-theme"
            >
              Manage Gatherings
            </Link>
            <Link
              href="/organiser/check-in"
              className="px-5 py-2 rounded-[50px] text-xs font-sans tracking-wider uppercase text-theme-secondary hover:text-theme-primary transition-colors border border-theme"
            >
              Door Scanner
            </Link>
            <Link
              href="/events"
              className="px-5 py-2 rounded-[50px] text-xs font-sans tracking-wider uppercase text-theme-secondary hover:text-theme-primary transition-colors"
            >
              Public Catalog
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/organiser/events/new"
              className="inline-flex items-center gap-2 px-6 py-2 rounded-[50px] text-xs font-sans uppercase tracking-[0.2em] font-medium bg-theme-primary text-theme-inverse hover:opacity-90 transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Gathering</span>
            </Link>
          </div>
        </div>

        <ScrollLine direction="horizontal" origin="left" />

        {/* Main Interactive Dashboard View */}
        <DashboardView />
      </div>
    </div>
  );
}
