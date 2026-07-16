import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../../../lib/libsupabaseClient';

type Role = 'owner' | 'staff' | null;

interface AuthContextValue {
  session: Session | null;
  role: Role;
  isOwner: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  async function fetchRole(userId: string) {
    if (!supabase) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Failed to fetch role (defaulting to staff):', error);
      setRole('staff');
      return;
    }
    setRole((data?.role as Role) || 'staff');
  }

  useEffect(() => {
    let isMounted = true;

    supabase?.auth.getSession().then(async ({ data }: { data: { session: Session | null } }) => {
      if (!isMounted) return;
      setSession(data.session);
      if (data.session?.user) {
        await fetchRole(data.session.user.id);
      }
      if (isMounted) setLoading(false);
    });

    const { data: listener } = supabase?.auth.onAuthStateChange(
      async (_event: string, newSession: Session | null) => {
        setSession(newSession);
        if (newSession?.user) {
          await fetchRole(newSession.user.id);
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