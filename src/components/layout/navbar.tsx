"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Ticket, LayoutDashboard, Compass, LogOut, RefreshCw, Menu, X, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, role, isOrganiser, quickSwitch, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDropdownOpen, setAuthDropdownOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Featured', icon: Compass },
    { href: '/events', label: 'All Gatherings', icon: Compass },
    { href: '/my-tickets', label: 'My Passes', icon: Ticket },
    { href: '/organiser', label: 'Organiser Hub', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full apple-liquid-glass border-b border-theme transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
        {/* Brand Logo in Zen Old Mincho */}
        <Link href="/" className="flex items-center gap-3.5 group focus:outline-none">
          <div className="flex flex-col">
            <span className="font-mincho text-2xl sm:text-3xl tracking-[0.25em] text-theme-primary group-hover:opacity-80 transition-opacity uppercase font-normal">
              AFTR
            </span>
            <span className="text-[9px] font-sans tracking-[0.3em] uppercase text-theme-tertiary -mt-0.5">
              Nocturnal Culture
            </span>
          </div>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-theme-primary opacity-80" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-theme-subtle border border-theme rounded-[50px] p-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-2 rounded-[50px] text-xs tracking-wider transition-all duration-300 ${isActive
                    ? 'bg-theme-card text-theme-primary font-medium shadow-sm border border-theme'
                    : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-card/50'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Theme Toggle, Role Switcher & CTA */}
        <div className="hidden md:flex items-center gap-3">
          {/* Light / Dark Mode Toggle */}
          <ThemeToggle />

          {/* Quick Demo Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setAuthDropdownOpen(!authDropdownOpen)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-[50px] bg-theme-subtle border border-theme hover:border-theme-accent text-xs text-theme-secondary transition-all focus:outline-none cursor-pointer"
              title="Click to switch demo role"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isOrganiser ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className="font-sans text-[11px] uppercase tracking-wider text-theme-tertiary">{role}</span>
              <span className="font-mincho text-theme-primary font-normal max-w-[120px] truncate">{user?.full_name?.split(' ')[0] || 'Guest'}</span>
              <RefreshCw className="w-3 h-3 text-theme-tertiary hover:text-theme-primary transition-transform" />
            </button>

            {authDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 p-4 rounded-[2px] bg-theme-card border border-theme shadow-2xl z-50">
                <div className="px-2 py-2 border-b border-theme mb-3">
                  <p className="text-[10px] text-theme-tertiary uppercase font-sans tracking-[0.25em]">Session Switcher</p>
                  <p className="text-sm font-mincho text-theme-primary truncate pt-0.5">{user?.full_name}</p>
                  <p className="text-xs text-theme-tertiary truncate font-sans">{user?.email}</p>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      quickSwitch('organiser');
                      setAuthDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-[2px] text-xs text-left transition-colors cursor-pointer ${isOrganiser ? 'bg-theme-subtle text-theme-primary border border-theme-accent' : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-subtle border border-transparent'
                      }`}
                  >
                    <div>
                      <div className="font-mincho text-theme-primary font-medium">Arjun Mehta (Organiser)</div>
                      <div className="text-[11px] text-theme-tertiary font-sans">Festival dashboard &amp; door scanner</div>
                    </div>
                    {isOrganiser && <ShieldCheck className="w-4 h-4 text-theme-primary" />}
                  </button>

                  <button
                    onClick={() => {
                      quickSwitch('attendee');
                      setAuthDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-[2px] text-xs text-left transition-colors cursor-pointer ${!isOrganiser ? 'bg-theme-subtle text-theme-primary border border-theme-accent' : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-subtle border border-transparent'
                      }`}
                  >
                    <div>
                      <div className="font-mincho text-theme-primary font-medium">Rhea Kapoor (Attendee)</div>
                      <div className="text-[11px] text-theme-tertiary font-sans">Book passes &amp; display QR tickets</div>
                    </div>
                    {!isOrganiser && <ShieldCheck className="w-4 h-4 text-theme-primary" />}
                  </button>

                  <div className="pt-2 border-t border-theme mt-2">
                    <button
                      onClick={() => {
                        logout();
                        setAuthDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2 py-2 text-xs text-theme-tertiary hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/events"
            className="px-5 py-2 rounded-[50px] text-xs font-sans tracking-[0.2em] uppercase border border-theme text-theme-primary hover:bg-theme-primary hover:text-theme-inverse transition-all duration-300"
          >
            Explore
          </Link>
        </div>

        {/* Mobile Hamburger & Theme Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-[2px] bg-theme-subtle border border-theme text-theme-primary focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-theme-card border-b border-theme px-6 py-6 space-y-4">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-[2px] text-sm text-theme-secondary hover:text-theme-primary hover:bg-theme-subtle"
              >
                <link.icon className="w-4 h-4 text-theme-primary" />
                <span className="font-mincho">{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-theme">
            <p className="text-[10px] text-theme-tertiary uppercase font-sans tracking-[0.25em] px-2 mb-3">Switch Role</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  quickSwitch('organiser');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2.5 rounded-[2px] text-xs font-sans tracking-wider border text-center cursor-pointer ${isOrganiser ? 'bg-theme-primary text-theme-inverse border-theme-primary' : 'bg-theme-subtle text-theme-tertiary border-theme'
                  }`}
              >
                Arjun (Organiser)
              </button>
              <button
                onClick={() => {
                  quickSwitch('attendee');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2.5 rounded-[2px] text-xs font-sans tracking-wider border text-center cursor-pointer ${!isOrganiser ? 'bg-theme-primary text-theme-inverse border-theme-primary' : 'bg-theme-subtle text-theme-tertiary border-theme'
                  }`}
              >
                Rhea (Attendee)
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
