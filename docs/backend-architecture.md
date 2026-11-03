# PADDLE TOP — Backend foundation (Phase 1)

Status: repository schema only. Not deployed. No Auth flow, checkout, RPC implementation, or frontend integration.

## Architecture

- Existing React/TypeScript/Vite frontend stays unchanged.
- Supabase PostgreSQL is the only authoritative app database.
- Simple reads use Supabase queries subject to RLS; business mutations that must be atomic will use PostgreSQL RPCs.
- Edge Functions are reserved for later trusted external-provider calls (PayMongo).
- Single venue with four immutable court identities: court-1, court-2, court-3, court-4.
- Venue date/time interpretation: Asia/Manila. Instants/expiry use timestamptz.
- Phase 1 uses no new runtime dependencies, no external APIs, and no live Supabase project.

## Tables and relationships

| Table | Relationship / purpose |
| --- | --- |
| courts | Four known IDs; referenced by reservations, holds, closures, and claims |
| venue_settings | Singleton row; unresolved price, hours, location, contact, and policy data NULL |
| customer_profiles | One-to-one with auth.users (Phase 2 account integration) |
| owner_admin_users | Trusted auth.users membership: the sole owner/admin role |
| booking_holds | Customer + court + time range; expires_at and status |
| court_slot_claims | One active claim per (court_id, slot_start_at) |
| court_reservations | Court + nullable customer for walk-ins; unique reference_code |
| court_closures | Single-court or all-court time range; conflict review later |
| paddle_products | Catalog, visible/featured flags, nullable draft price, nonnegative stock |
| paddle_orders | One product, guest or signed-in buyer, unique reference, price snapshot |
| financial_transactions | Backend-created operational ledger linked to one reservation or order |

No fictional catalog items or venue information are inserted. Four courts and a timezone-only settings row are seeded.

## Hourly occupancy

court_slot_claims contains only currently held/occupied claims; its primary key (court_id, slot_start_at) makes overlapping claims for a specific court/hour impossible. Each claim references exactly one booking_hold or court_reservation and must match that record's court.

Future RPCs must, within one coordinated transaction:
1. Check venue settings, consecutive hourly slot boundaries, booking lead/window rules, closures, and current occupancy.
2. Safely clear expired hold claims before competing for requested slot keys; serialize this with concurrent hold/closure/reservation operations.
3. Insert one claim per requested hour; reject a conflict rather than overwriting an existing claim.
4. On trusted payment confirmation, atomically transfer hold claims to a reservation. On release/cancellation, remove the appropriate claims.
5. For walk-ins and extensions, use the same locking/occupancy mechanism. A successful availability read alone never authorizes a write.

This migration does not implement the RPCs, expiry job, or claim lifecycle. A cancelled booking is not a refund. Slot claims alone are not sufficient to prevent booking outside operating hours; future RPCs enforce those rules.

## RLS / authorization

All 11 public tables have RLS enabled. Anonymous/authenticated users can SELECT only enabled courts, the public singleton venue settings row, and visible products. Authenticated users have SELECT on their own profile, holds, reservations, and orders through auth.uid(). No public or authenticated direct write grants are created.

Owner membership lives in owner_admin_users, never client-editable metadata. No client can read or self-provision the membership table. In Phase 2, add a narrowly scoped trusted owner check and the minimum owner policies/RPC authorizations required for the UI. Review SECURITY DEFINER privileges, search_path and EXECUTE grants if used. Sensitive operational tables/claims remain unavailable to the public API.

An anonymous guest order submission is not implemented in Phase 1. Guest orders must not commit stock until trusted payment or trusted owner confirmation; inventory_committed_at is merely a nullable placeholder, not a payment/stock workflow. Temporary inventory holds are deferred. Price, payment_status, and stock writes require trusted backend verification.

## Planned RPCs (none implemented yet)

- Public: get_court_availability(date)
- Customer: create_booking_hold, get_active_booking_hold, release_booking_hold
- Trusted payment phase: confirm_paid_booking
- Owner: admin_create_walk_in, admin_extend_session, admin_update_reservation_status
- Owner: admin_create_closure, admin_reopen_court, admin_get_today_status
- Trusted ordering: create_paddle_order, admin_update_paddle_stock, admin_update_paddle_order_status
- Owner reads/aggregation: admin_get_analytics, plus normal RLS-backed queries where simpler

## Planned Edge Functions (none implemented)

- create_checkout (PayMongo server-side request; Phase 7)
- paymongo_webhook (provider verification, duplicate protection and trusted confirmation; Phase 7)

## Outstanding business values

- Real court hourly rate, operating hours, booking lead/window, hold duration
- Venue address, phone, email, policies and public-facing copy
- Owner account to provision; customer authentication choices in Phase 2
- Guest pickup order expiry/confirmation rules, stock release rules
- Cancellation policy, payment delays and eventual refund reconciliation

No automatic refund, customer self-reschedule, or customer self-refund in V1.

## Implementation phases

1. Database foundation (this migration, review only).
2. Supabase Auth, customer identity, owner authorization and RLS refinement.
3. Availability and atomic holds/expiry; concurrency tests.
4. Reservations, staff walk-ins, extensions and closures.
5. Unified paddle catalog/stock and guest/counter order policy.
6. Trusted financial ledger, analytics and venue settings integration.
7. PayMongo checkout/webhooks, payment verification and refunds if approved.

## Verification

Run migration against an isolated non-production Supabase database only, then run supabase/tests/phase1_assertions.sql. That smoke script executes writes inside a transaction and rolls back. It checks court seeds, FK, uniqueness, nonnegative stock and absence of fictional values. Before Phase 2, also verify the actual live database RLS grants and compile the unchanged frontend. Do not run the smoke script against a live production database.
