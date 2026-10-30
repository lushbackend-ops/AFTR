"use client";

import React, { useState, useMemo } from 'react';
import { aftrStore } from '@/lib/services/mock-store';
import { EventCard } from '@/components/events/event-card';
import { ScrollLine, SectionScrollDivider } from '@/components/ui/scroll-lines';
import { Search, SlidersHorizontal, Calendar } from 'lucide-react';

export default function EventsDiscoveryPage() {
  const allEvents = aftrStore.getEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(allEvents.map((e) => e.category));
    return ['all', ...Array.from(cats)];
  }, [allEvents]);

  const cities = useMemo(() => {
    const c = new Set(allEvents.map((e) => e.city));
    return ['all', ...Array.from(c)];
  }, [allEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      const matchSearch =
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.venue_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.city.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = selectedCategory === 'all' || ev.category === selectedCategory;
      const matchCity = selectedCity === 'all' || ev.city === selectedCity;

      return matchSearch && matchCategory && matchCity;
    });
  }, [allEvents, searchQuery, selectedCategory, selectedCity]);

  return (
    <div className="bg-theme-base text-theme-primary min-h-screen font-mincho transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 space-y-12">
        {/* Editorial Header */}
        <div className="space-y-4 max-w-3xl pb-4">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-theme-primary opacity-60" />
            <span className="text-xs font-sans tracking-[0.3em] uppercase text-theme-tertiary">
              Curation 2026/2027 • Gathering Archive
            </span>
            <span className="text-theme-tertiary font-sans text-xs">• {allEvents.length} Gatherings</span>
          </div>
          <h1 className="font-mincho text-4xl sm:text-6xl text-theme-primary font-normal tracking-tight">
            Curated Gatherings
          </h1>
          <p className="font-mincho text-sm sm:text-base text-theme-secondary leading-relaxed">
            From Rajasthan&apos;s desert fortresses to Goa&apos;s basalt cliffs and Bengaluru&apos;s bamboo canopies.
            Curated acoustic environments with deterministic transaction ticketing.
          </p>
        </div>

        {/* Scroll Line Divider */}
        <ScrollLine direction="horizontal" origin="left" />

        {/* Filter and Search Bar with wed.md tokens */}
        <div className="bg-theme-card p-6 rounded-[2px] border border-theme space-y-4 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Field */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-theme-tertiary" />
              <input
                type="text"
                placeholder="Search by gathering, city, or acoustic sanctuary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-theme-subtle border border-theme rounded-[2px] text-xs font-sans tracking-wider text-theme-primary placeholder-theme-tertiary focus:outline-none focus:border-theme-accent transition-all"
              />
            </div>

            {/* City Selector */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="appearance-none bg-theme-subtle border border-theme rounded-[2px] px-5 py-3 pr-10 text-xs font-sans tracking-wider text-theme-secondary focus:outline-none focus:border-theme-accent cursor-pointer"
                >
                  <option value="all" className="bg-theme-card text-theme-primary">All Cities</option>
                  {cities.filter(c => c !== 'all').map((city) => (
                    <option key={city} value={city} className="bg-theme-card text-theme-primary">
                      {city}
                    </option>
                  ))}
                </select>
                <SlidersHorizontal className="w-3.5 h-3.5 absolute right-3.5 top-1/2 -translate-y-1/2 text-theme-tertiary pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-theme-subtle">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-[50px] text-xs font-sans tracking-wider transition-all duration-300 cursor-pointer ${isSelected
                      ? 'bg-theme-primary text-theme-inverse font-medium shadow-sm'
                      : 'border border-theme text-theme-secondary hover:text-theme-primary hover:border-theme-accent'
                    }`}
                >
                  {cat === 'all' ? 'All Disciplines' : cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Divider with Scroll Animation */}
        <SectionScrollDivider number="CATALOG" label={`${filteredEvents.length} GATHERINGS AVAILABLE`} />

        {/* Events Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-theme-card p-12 rounded-[2px] border border-theme text-center space-y-4 max-w-md mx-auto shadow-xl">
            <Calendar className="w-8 h-8 text-theme-tertiary mx-auto" />
            <h3 className="text-xl font-mincho text-theme-primary font-normal">No Gatherings Found</h3>
            <p className="text-xs font-mincho text-theme-secondary">
              No gatherings match your selected criteria. Try resetting your search filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedCity('all');
              }}
              className="px-6 py-2.5 rounded-[50px] border border-theme hover:border-theme-accent text-xs font-sans tracking-widest text-theme-secondary hover:text-theme-primary transition-colors uppercase cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
