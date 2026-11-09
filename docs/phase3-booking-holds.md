# PADDLE TOP — Phase 3 temporary court holds

Scope: public availability and Google-authenticated temporary holds only.
No confirmed reservations, payment checkout, walk-ins, extension, refunds, or
owner mutations.

## RPC surface

| Function | Access | Purpose |
| --- | --- | --- |
| get_court_availability(p_date date) | anon + authenticated | JSONB result with configured/message, authoritative hourly rate, duration and enabled courts/slots |
| create_booking_hold(p_court_id text, p_date date, p_start_time time, p_end_time time) | authenticated | Creates one active temporary hold and claims its consecutive hours atomically |
| get_active_booking_hold(p_hold_id uuid DEFAULT NULL) | authenticated | Returns only the caller's active hold (or NULL), with court, prices and authoritative expiry |
| release_booking_hold(p_hold_id uuid) | authenticated | Atomically releases only the caller's own active hold; repeated release is safe |

Browser code does not directly write booking_holds or court_slot_claims.
Customer identity, price, duration, and expiry are always computed by SQL,
not accepted from the browser.

## Hourly claim and expiry model

- Court-1 to Court-4 remain the only recognized court identities.
- All instants are timestamptz; hours are interpreted in Asia/Manila.
- The SQL accepts only same-calendar-day, whole-hour operating windows
  with opening_time earlier than closing_time. Overnight operating windows
  are not supported in Phase 3 and return "not configured" instead of
  guessing which date an overnight slot belongs to.
- Each create/release/cleanup operation acquires an identical transaction-scoped
  advisory lock keyed by court ID. Competing holds therefore serialize.
- The existing PRIMARY KEY (court_id, slot_start_at) on court_slot_claims is
  the final database uniqueness guarantee even if two writes compete.
- Cleanup marks expired holds expired, then removes **only** claim_source='hold'
  claims attached to expired/released/converted holds. It does not delete
  reservation/walk-in/extension claims.
- Public availability performs lazy cleanup, and also excludes past hours,
  held hours, existing reservation claims and active closures.
- The client countdown reflects expires_at but cannot release or extend
  database claims on its own. There is no paid cron or background service.
- Future Phase 4 writers must use the same per-court lock before touching
  claims or closures to avoid check/claim races.

## Venue configuration

The hosted Phase 1 singleton has intentionally unconfirmed NULL values.
No production prices, hours, contact or policy values are included in this
migration. Online booking is not configured until at least:

- hourly_rate_php >= 0
- opening_time and closing_time set to different, whole-hour same-day times
- hold_duration_minutes > 0

Optional min_booking_lead_minutes and max_booking_days_ahead are enforced
when non-NULL. For tests, synthetic values appear only inside rolled-back
SQL transactions or a disposable container database.

## Frontend flow

Public availability loads from Supabase. A user chooses a court and adjacent
hours, signs in via the existing Google OAuth gate only if needed, then the
server creates a real hold. A saved pre-OAuth selection is sessionStorage-only
and is revalidated by the hold RPC. Active holds restore from the database
after refresh and show server prices/expiry; release and expiry refresh slots.

If venue settings are incomplete, the UI displays:
"Online booking is not configured yet." It never falls back to the demo
rate/hours or creates a mock hold/paid reservation.

## Verification

CI runs immutable Phase 1 + Phase 2 and the Phase 3 migration against
disposable PostgreSQL 17 with Supabase Auth fixture roles. SQL assertions
cover RLS ownership, expiry, cleanup, settings, hours, claims, and release.
A separate two-client PostgreSQL transaction race must produce exactly
one successful hold and one conflict. npm ci, TypeScript and Vite build run
on every Phase 3 branch push.

Actual production venue values and manual live Google/OAuth and browser UX
tests are still outstanding. Do not treat a temporary hold as confirmation.
