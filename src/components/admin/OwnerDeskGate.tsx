import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { AdminLayout } from './AdminLayout';
import { AuthGateModal } from '../booking/AuthGateModal';

interface OwnerDeskGateProps {
  onNavigateHome: () => void;
  onNavigateBooking: () => void;
  onNavigatePaddles: () => void;
}

type OwnerResult = {
  userId: string;
  status: 'owner' | 'not-owner' | 'error';
};

export const OwnerDeskGate: React.FC<OwnerDeskGateProps> = (props) => {
  const { user, loading, signOut } = useAuth();
  const [result, setResult] = useState<OwnerResult | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!user || !supabase) return;
    let current = true;
    const userId = user.id;
    const check = async () => {
      try {
        // Verify the Auth user on the server, then check membership via RLS-safe
        // boolean RPC. This is not the authorization boundary for future writes.
        const { data: verified, error: verifyError } = await supabase.auth.getUser();
        if (verifyError || verified.user?.id !== userId) {
          throw new Error('Unable to verify the signed-in user');
        }
        const { data: isOwner, error } = await supabase.rpc('is_current_user_owner');
        if (error) throw error;
        if (current) setResult({ userId, status: isOwner === true ? 'owner' : 'not-owner' });
      } catch {
        if (current) setResult({ userId, status: 'error' });
      }
    };
    void check();
    return () => { current = false; };
  }, [user?.id, retry]);

  if (!loading && user && result?.userId === user.id && result.status === 'owner') {
    return <AdminLayout {...props} onSignOut={signOut} />;
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-[#070D18] text-neutral-900 dark:text-neutral-100 flex items-center justify-center p-5 font-sans">
      {loading || (user && result?.userId !== user.id) ? (
        <p role="status" className="text-sm text-neutral-600 dark:text-neutral-300">
          Verifying your session…
        </p>
      ) : !user ? (
        <div className="w-full max-w-md space-y-4">
          <AuthGateModal mode="owner" embedded />
          <button type="button" onClick={props.onNavigateHome}
            className="text-sm text-neutral-600 dark:text-neutral-300 underline">
            Return to public website
          </button>
        </div>
      ) : result?.status === 'not-owner' ? (
        <div className="max-w-md w-full bg-white dark:bg-[#0E172A] border border-neutral-200 dark:border-white/10 rounded-2xl p-7 space-y-4">
          <h1 className="text-2xl font-bold">Owner access required</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">
            You are signed in, but this account is not an approved Owner Desk member.
          </p>
          <div className="flex gap-4 text-sm font-semibold">
            <button onClick={() => void signOut()} className="underline">Sign out</button>
            <button onClick={props.onNavigateHome} className="underline">Public website</button>
          </div>
        </div>
      ) : result?.status === 'error' ? (
        <div className="max-w-md w-full bg-white dark:bg-[#0E172A] border border-neutral-200 dark:border-white/10 rounded-2xl p-7 space-y-4">
          <h1 className="text-xl font-bold">Owner access could not be verified</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-300">Check your connection and try again.</p>
          <button type="button" onClick={() => { setResult(null); setRetry((n) => n + 1); }}
            className="px-4 py-2 rounded-lg bg-[#84CC16] font-semibold text-neutral-950">Try again</button>
        </div>
      ) : (
        <p role="status" className="text-sm text-neutral-600 dark:text-neutral-300">Checking owner access…</p>
      )}
    </div>
  );
};
