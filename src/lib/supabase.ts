import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

// Public frontend credentials only. Absence of configuration never grants access.
export const supabase = url && key
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const authConfigured = Boolean(supabase);

export function authRedirectUrl(): string {
  // Reuse the current route so /booking or /admin resumes after OAuth/Magic Link.
  return window.location.origin + window.location.pathname + window.location.search;
}
