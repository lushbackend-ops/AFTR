"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { ShieldCheck, ArrowRight, UserCheck, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, quickSwitch } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email || 'attendee@aftr.events', email.includes('organiser') ? 'organiser' : 'attendee');
    setIsLoading(false);
    if (email.includes('organiser')) {
      router.push('/organiser');
    } else {
      router.push('/my-tickets');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md p-8 rounded-3xl glass-surface border border-white/10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="font-editorial text-3xl font-bold text-white">AFTR</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </Link>
          <h1 className="font-editorial text-2xl font-bold text-white">Sign In to Your Vault</h1>
          <p className="text-xs text-zinc-400">Access your digital passes and organiser controls</p>
        </div>

        {/* Demo Credentials Quick Switcher Banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
          <p className="font-mono text-amber-300 font-semibold uppercase text-[10px] tracking-wider flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Instant Demo Logins</span>
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                quickSwitch('organiser');
                router.push('/organiser');
              }}
              className="p-2 rounded-xl bg-black/40 border border-white/10 hover:border-amber-400/50 text-left text-zinc-200 transition-colors"
            >
              <span className="block font-semibold text-white">Julian (Organiser)</span>
              <span className="text-[10px] text-zinc-400">organiser@aftr.events</span>
            </button>
            <button
              type="button"
              onClick={() => {
                quickSwitch('attendee');
                router.push('/my-tickets');
              }}
              className="p-2 rounded-xl bg-black/40 border border-white/10 hover:border-emerald-400/50 text-left text-zinc-200 transition-colors"
            >
              <span className="block font-semibold text-white">Elena (Attendee)</span>
              <span className="text-[10px] text-zinc-400">attendee@aftr.events</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-zinc-400 uppercase">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-zinc-400 uppercase">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-zinc-950 hover:bg-amber-300 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 pt-2 border-t border-white/5">
          <span>Don&apos;t have an account yet? </span>
          <Link href="/signup" className="text-amber-400 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
