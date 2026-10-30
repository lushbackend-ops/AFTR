"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile, UserRole } from '@/types/database';

interface AuthContextType {
  user: Profile | null;
  role: UserRole;
  isOrganiser: boolean;
  isAttendee: boolean;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  quickSwitch: (role: UserRole) => void;
}

const DEMO_ORGANISER: Profile = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'arjun@aftr.events',
  full_name: 'Arjun Mehta (AFTR India)',
  role: 'organiser',
  created_at: new Date().toISOString(),
};

const DEMO_ATTENDEE: Profile = {
  id: '22222222-2222-2222-2222-222222222222',
  email: 'rhea@aftr.events',
  full_name: 'Rhea Kapoor',
  role: 'attendee',
  created_at: new Date().toISOString(),
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(DEMO_ATTENDEE);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('aftr_session_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to demo attendee for frictionless instant exploration
        setUser(DEMO_ATTENDEE);
        localStorage.setItem('aftr_session_user', JSON.stringify(DEMO_ATTENDEE));
      }
    } catch {
      setUser(DEMO_ATTENDEE);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, role: UserRole = 'attendee') => {
    setIsLoading(true);
    let profile: Profile;
    if (email.toLowerCase().includes('organiser') || email.toLowerCase().includes('arjun')) {
      profile = {
        id: '11111111-1111-1111-1111-111111111111',
        email,
        full_name: 'Arjun Mehta (AFTR Organiser)',
        role: 'organiser',
        created_at: new Date().toISOString(),
      };
    } else {
      profile = {
        id: '22222222-2222-2222-2222-222222222222',
        email,
        full_name: email.split('@')[0],
        role,
        created_at: new Date().toISOString(),
      };
    }

    setUser(profile);
    localStorage.setItem('aftr_session_user', JSON.stringify(profile));
    // Also save cookie for server components
    document.cookie = `aftr_user_id=${profile.id}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `aftr_user_role=${profile.role}; path=/; max-age=604800; SameSite=Lax`;
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aftr_session_user');
    document.cookie = `aftr_user_id=; path=/; max-age=0; SameSite=Lax`;
    document.cookie = `aftr_user_role=; path=/; max-age=0; SameSite=Lax`;
  };

  const quickSwitch = (newRole: UserRole) => {
    const target = newRole === 'organiser' ? DEMO_ORGANISER : DEMO_ATTENDEE;
    setUser(target);
    localStorage.setItem('aftr_session_user', JSON.stringify(target));
    document.cookie = `aftr_user_id=${target.id}; path=/; max-age=604800; SameSite=Lax`;
    document.cookie = `aftr_user_role=${target.role}; path=/; max-age=604800; SameSite=Lax`;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'attendee',
        isOrganiser: user?.role === 'organiser',
        isAttendee: user?.role === 'attendee',
        isLoading,
        login,
        logout,
        quickSwitch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
