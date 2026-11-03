# PADDLE TOP — Phase 2 Auth setup

Phase 2 introduces **only** Supabase Auth, self-owned customer profiles, and
one trusted owner/admin membership check. The existing frontend still uses
demonstration data for availability, holds, bookings, paddles and Owner Desk
operations. **A real login does not create a real reservation or payment.**
Backend booking RPCs, live catalog and payment integration are future phases.

## Environment

Copy the placeholders in `.env.example` into an uncommitted `.env.local`:

- `VITE_SUPABASE_URL`: URL of the **PADDLE TOP Development** Supabase project.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: project's enabled `sb_publishable_...` key.

The Vite browser build uses only these public values; never put a service-role
key, Supabase secret key, DB password, or OAuth client secret in Vite variables.
In CI without config, public pages compile; login clearly reports it is not
configured instead of allowing simulated authentication.

## Supabase Dashboard configuration (manual)

1. **Authentication → URL Configuration**: set Site URL to the actual deployed
   site when chosen. For development, allow the exact local origin and relevant
   paths (Vite default `http://localhost:3000`, including `/booking` and
   `/admin`). Add exact production redirect URLs once the hostname is known;
   avoid broad production wildcards.
2. **Authentication → Providers → Google**: enable Google after supplying
   a Google Cloud OAuth **Web Client ID and Client Secret**. In Google Cloud,
   configure authorized JavaScript origins for local and actual production
   origins, and Google's **Authorized redirect URI**:
   `https://ofznfywgvkwlvxzahezd.supabase.co/auth/v1/callback`
   (the Supabase callback, not the React route). Use ordinary identity scopes.
3. **Authentication → Providers → Email**: enable email sign-in. This app calls
   `signInWithOtp` with the default **Magic Link** email, not numeric OTP;
   no custom template or paid mail service is necessary for Phase 2. Use
   Supabase's built-in email limits during development. Configure a sending
   provider only if future production deliverability requires it.
4. After login, the app restores its persisted Supabase browser session and
   handles OAuth/Magic Link redirects on the same route. A selected booking
   draft is kept in **sessionStorage only for navigation continuity**;
   it is NOT a booking hold or session credential.

## First owner provisioning (manual, no public admin UI)

1. Sign in once through either supported method. Confirm the user exists in
   Supabase **Authentication → Users**.
2. Confirm the intended real owner identity and copy its **auth.users.id**.
3. In the **PADDLE TOP Development project only**, run a trusted SQL Editor
   insert replacing the placeholder with that verified UUID:

   ```sql
   insert into public.owner_admin_users(user_id)
   values ('REPLACE_WITH_VERIFIED_AUTH_USER_UUID'::uuid)
   on conflict (user_id) do nothing;
   ```

4. Visit `/admin` with that same normal Supabase session. Other authenticated
   accounts see an unauthorized state. To revoke access, delete that membership
   row using the trusted SQL Editor; future privileged RPCs must independently
   recheck membership.

No account is automatically promoted using email domain, user_metadata,
app navigation, or a browser-only role flag.

## Database / RLS

The Phase 2 migration **adds** INSERT and UPDATE grants for the current user's
profile only. The `user_id` ownership column has no UPDATE grant and both
policies check `auth.uid()`. Existing own-row SELECT policies remain.

`owner_admin_users` remains RLS-enabled without browser grants/policies. The
non-exposed `private.is_current_user_owner` SECURITY DEFINER reads membership
with fixed search_path, explicit caller UID, and restricted EXECUTE. A tiny
`public.is_current_user_owner()` SECURITY INVOKER RPC returns **only a boolean**
to authenticated callers. No other owner policies or operational writes
are introduced.

## Checks and phase boundary

- SQL: apply Phase 1 + Phase 2 to a disposable PostgreSQL 17 database
  with mock auth functions, then run both RLS/constraint smoke files.
- Frontend: `npm ci && npm run lint && npm run build`.
- Manual after Google/Email dashboard configuration: test sign-in, magic
  email link, redirect, session restoration, sign-out, non-owner /admin denial,
  and verified owner /admin access.

**Unimplemented:** real availability, holds/expiry, reservation checkout,
walk-in writes, owner inventory operations, refunds, payment and Edge Functions.
