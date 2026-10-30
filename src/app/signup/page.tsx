"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { UserRole } from '@/types/database';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('attendee');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await login(email, role);
    setIsLoading(false);
    if (role === 'organiser') {
      router.push('/organiser');
    } else {
      router.push('/events');
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
          <h1 className="font-editorial text-2xl font-bold text-white">Join the Collective</h1>
          <p className="text-xs text-zinc-400">Create your identity for reservations or event curation</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-mono text-zinc-400 uppercase">Role Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRole('attendee')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  role === 'attendee'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-semibold'
                    : 'bg-white/5 text-zinc-400 border-white/10'
                }`}
              >
                Attendee
              </button>
              <button
                type="button"
                onClick={() => setRole('organiser')}
                className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                  role === 'organiser'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold'
                    : 'bg-white/5 text-zinc-400 border-white/10'
                }`}
              >
                Organiser
              </button>
            </div>
          </div>

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
            <label className="text-xs font-mono text-zinc-400 uppercase">Create Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400/50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-white text-zinc-950 hover:bg-amber-300 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <span>{isLoading ? 'Creating Account...' : 'Register Profile'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-zinc-500 pt-2 border-t border-white/5">
          <span>Already registered? </span>
          <Link href="/login" className="text-amber-400 hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
