import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../../lib/libsupabaseClient';

const ROLE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL || ''}/functions/v1/get-admin-role`;

type Role = 'owner' | 'staff' | null;

interface AuthContextValue {
  session: Session | null;
  role: Role;
  isOwner: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

function normalizeRole(value: unknown): Role {
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'owner' || normalized === 'staff') {
      return normalized as Role;
    }
  }
  return null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  async function fetchRole(session?: Session | null) {
    if (!supabase) return;

    const metadataRole = normalizeRole(session?.user?.user_metadata?.role ?? session?.user?.app_metadata?.role);
    if (metadataRole) {
      setRole(metadataRole);
      return;
    }

    if (!session?.access_token) {
      setRole(null);
      return;
    }

    try {
      const response = await fetch(ROLE_FUNCTION_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Role lookup failed: ${response.status}`);
      }

      const payload = await response.json();
      setRole(normalizeRole(payload?.role));
    } catch (error) {
      console.error('Failed to fetch role from edge function:', error);
      setRole(null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    supabase?.auth.getSession().then(async ({ data }: { data: { session: Session | null } }) => {
      if (!isMounted) return;
      setSession(data.session);
      await fetchRole(data.session);
      if (isMounted) setLoading(false);
    });

    const { data: listener } = supabase?.auth.onAuthStateChange(
      async (_event: string, newSession: Session | null) => {
        setSession(newSession);
        if (newSession) {
          await fetchRole(newSession);
        } else {
          setRole(null);
        }
      }
    ) || {};

    return () => {
      isMounted = false;
      if (listener?.subscription) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  async function signIn(email: string, password: string) {
    if (!supabase) return { error: 'Supabase not configured' };
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, role, isOwner: role === 'owner', loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}