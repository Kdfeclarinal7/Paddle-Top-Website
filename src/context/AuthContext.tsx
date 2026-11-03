import React, {
  createContext, useContext, useEffect, useMemo, useState,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { authConfigured, authRedirectUrl, supabase } from '../lib/supabase';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<void>;
  sendMagicLink: (email: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function ensureCustomerProfile(user: User) {
  if (!supabase) return;
  const { data, error } = await supabase
    .from('customer_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || data) return;

  // Display-only metadata is never used to grant owner access.
  const metadata = user.user_metadata;
  const displayName = metadata?.display_name || metadata?.full_name || metadata?.name || null;
  const { error: insertError } = await supabase
    .from('customer_profiles')
    .insert({ user_id: user.id, display_name: displayName });
  // Another tab may have created it while this request was in flight.
  if (insertError && insertError.code !== '23505') {
    // Profile creation is best-effort; a failed profile write must not log a
    // valid user out or block access to the public site.
  }
}

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Supabase restores its own persistent browser session and handles
    // auth redirects. Do not await a database query inside this callback.
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      setUser(error ? null : data.session?.user ?? null);
      setLoading(false);
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) void ensureCustomerProfile(user);
  }, [user?.id]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    configured: authConfigured,
    async signInWithGoogle() {
      if (!supabase) throw new Error('Authentication has not been configured.');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: authRedirectUrl() },
      });
      if (error) throw error;
    },
    async sendMagicLink(email, name) {
      if (!supabase) throw new Error('Authentication has not been configured.');
      const trimmedName = name?.trim();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: authRedirectUrl(),
          ...(trimmedName ? { data: { display_name: trimmedName } } : {}),
        },
      });
      if (error) throw error;
    },
    async signOut() {
      if (!supabase) return;
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be within AuthProvider');
  return context;
}
