-- PADDLE TOP V1 / Phase 1: database foundation only.
-- No production pricing, operating hours, contact details, auth workflows,
-- booking/payment RPCs, or demo catalog items are seeded here.
-- Apply only to a designated non-production Supabase project after review.

create table public.courts (
  id text primary key check (id in ('court-1', 'court-2', 'court-3', 'court-4')),
  name text not null,
  display_order smallint not null unique check (display_order between 1 and 4),
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

-- One venue, one settings row. Unconfirmed business values stay NULL.
create table public.venue_settings (
  id smallint primary key default 1 check (id = 1),
  timezone text not null default 'Asia/Manila' check (timezone = 'Asia/Manila'),
  venue_name text,
  hourly_rate_php numeric(12, 2) check (hourly_rate_php >= 0),
  opening_time time without time zone,
  closing_time time without time zone,
  max_booking_days_ahead integer check (max_booking_days_ahead > 0),
  min_booking_lead_minutes integer check (min_booking_lead_minutes >= 0),
  hold_duration_minutes integer check (hold_duration_minutes > 0),
  venue_address text,
  venue_phone text,
  venue_email text,
  policy_text text,
  auto_mark_completed boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint venue_distinct_open_close check (
    opening_time is null or closing_time is null or opening_time <> closing_time
  )
);

create table public.customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Membership itself is the sole owner/admin role. No client write access.
-- Phase 2 will add a trusted authorization mechanism for owner operations.
create table public.owner_admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now(),
  added_by uuid references auth.users(id) on delete set null
);

create table public.booking_holds (
  id uuid primary key default gen_random_uuid(),
  customer_user_id uuid not null references auth.users(id) on delete restrict,
  court_id text not null references public.courts(id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  hourly_rate_php numeric(12, 2) not null check (hourly_rate_php >= 0),
  total_price_php numeric(12, 2) not null check (total_price_php >= 0),
  status text not null default 'active'
    check (status in ('active', 'released', 'expired', 'converted')),
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  unique (id, court_id),
  constraint hold_positive_whole_hours check (
    ends_at > starts_at and
    mod(extract(epoch from (ends_at - starts_at)), 3600) = 0
  ),
  constraint hold_valid_expiry check (expires_at > created_at)
);

create table public.court_reservations (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  court_id text not null references public.courts(id) on delete restrict,
  customer_user_id uuid references auth.users(id) on delete restrict,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  origin text not null check (origin in ('online', 'walk_in')),
  status text not null default 'confirmed'
    check (status in ('confirmed', 'active', 'completed', 'no_show', 'cancelled')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  hourly_rate_php numeric(12, 2) not null check (hourly_rate_php >= 0),
  total_price_php numeric(12, 2) not null check (total_price_php >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, court_id),
  constraint reservation_positive_whole_hours check (
    ends_at > starts_at and
    mod(extract(epoch from (ends_at - starts_at)), 3600) = 0
  ),
  constraint online_reservation_has_owner check (
    origin <> 'online' or customer_user_id is not null
  )
);

-- Only currently occupying claims belong here. Released/expired hold claims
-- must be deleted inside the future atomic booking transaction. A unique
-- (court_id, slot_start_at) key prevents concurrent occupancy of one hour.
-- Conversion from a hold to a reservation updates claim ownership atomically.
create table public.court_slot_claims (
  court_id text not null references public.courts(id) on delete restrict,
  slot_start_at timestamptz not null,
  claim_source text not null
    check (claim_source in ('hold', 'reservation', 'walk_in', 'extension')),
  hold_id uuid,
  reservation_id uuid,
  created_at timestamptz not null default now(),
  primary key (court_id, slot_start_at),
  foreign key (hold_id, court_id)
    references public.booking_holds(id, court_id) on delete restrict,
  foreign key (reservation_id, court_id)
    references public.court_reservations(id, court_id) on delete restrict,
  constraint claim_has_exactly_one_owner check (
    (claim_source = 'hold' and hold_id is not null and reservation_id is null)
    or
    (claim_source in ('reservation', 'walk_in', 'extension')
      and hold_id is null and reservation_id is not null)
  ),
  constraint claim_starts_on_hour check (
    extract(minute from slot_start_at at time zone 'Asia/Manila') = 0 and
    extract(second from slot_start_at at time zone 'Asia/Manila') = 0
  )
);

create table public.court_closures (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('single_court', 'all_courts')),
  court_id text references public.courts(id) on delete restrict,
  reason text not null,
  note text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint closure_positive_duration check (ends_at > starts_at),
  constraint closure_scope_court_match check (
    (scope = 'single_court' and court_id is not null)
    or (scope = 'all_courts' and court_id is null)
  )
);

create table public.paddle_products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  series text,
  tagline text,
  short_description text,
  description text,
  price_php numeric(12, 2) check (price_php >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  visible boolean not null default false,
  featured boolean not null default false,
  specifications jsonb not null default '{}'::jsonb,
  theme_color jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint visible_product_has_price check (not visible or price_php is not null)
);

-- Single-product venue pickup orders, matching the V1 UI.
-- Guest orders may exist without auth, but have NO stock-commitment behavior
-- in Phase 1. inventory_committed_at is trusted-backend-only future state.
create table public.paddle_orders (
  id uuid primary key default gen_random_uuid(),
  reference_code text not null unique,
  product_id uuid not null references public.paddle_products(id) on delete restrict,
  customer_user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  customer_note text,
  quantity integer not null check (quantity > 0),
  unit_price_php numeric(12, 2) not null check (unit_price_php >= 0),
  total_price_php numeric(12, 2) not null check (total_price_php >= 0),
  order_status text not null default 'pending'
    check (order_status in ('pending', 'confirmed', 'ready_for_pickup',
                            'completed', 'cancelled')),
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  fulfillment_type text not null default 'venue_pickup'
    check (fulfillment_type = 'venue_pickup'),
  pickup_note text,
  inventory_committed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint paddle_order_total_matches_quantity check (
    total_price_php = unit_price_php * quantity
  )
);

-- Operational ledger only; no payment-provider logic or refund automation.
create table public.financial_transactions (
  id uuid primary key default gen_random_uuid(),
  reference_code text unique,
  transaction_type text not null
    check (transaction_type in ('court_booking', 'walk_in',
                               'court_extension', 'paddle_sale')),
  reservation_id uuid references public.court_reservations(id) on delete restrict,
  paddle_order_id uuid references public.paddle_orders(id) on delete restrict,
  amount_php numeric(12, 2) not null check (amount_php >= 0),
  payment_method text,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  note text,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint transaction_has_single_source check (
    num_nonnulls(reservation_id, paddle_order_id) = 1
  )
);

create index booking_holds_customer_idx on public.booking_holds(customer_user_id, expires_at);
create index booking_holds_active_court_idx on public.booking_holds(court_id, expires_at)
  where status = 'active';
create index reservations_court_time_idx on public.court_reservations(court_id, starts_at, ends_at);
create index reservations_customer_idx on public.court_reservations(customer_user_id, starts_at);
create index claims_hold_idx on public.court_slot_claims(hold_id) where hold_id is not null;
create index claims_reservation_idx on public.court_slot_claims(reservation_id)
  where reservation_id is not null;
create index closures_court_time_idx on public.court_closures(court_id, starts_at, ends_at)
  where active = true;
create index paddle_orders_customer_idx on public.paddle_orders(customer_user_id, created_at);
create index financial_transactions_time_idx on public.financial_transactions(created_at);

-- Only genuinely known structural seed data: exactly four court identities.
insert into public.courts(id, name, display_order) values
  ('court-1', 'Court 1', 1),
  ('court-2', 'Court 2', 2),
  ('court-3', 'Court 3', 3),
  ('court-4', 'Court 4', 4);

insert into public.venue_settings(id, timezone) values (1, 'Asia/Manila');

-- Minimal Phase 1 RLS: public intentional reads; customer own reads.
-- No client INSERT/UPDATE/DELETE policy or privileged admin RPC exists yet.
alter table public.courts enable row level security;
alter table public.venue_settings enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.owner_admin_users enable row level security;
alter table public.booking_holds enable row level security;
alter table public.court_slot_claims enable row level security;
alter table public.court_reservations enable row level security;
alter table public.court_closures enable row level security;
alter table public.paddle_products enable row level security;
alter table public.paddle_orders enable row level security;
alter table public.financial_transactions enable row level security;

revoke all on table
  public.courts, public.venue_settings, public.customer_profiles,
  public.owner_admin_users, public.booking_holds, public.court_slot_claims,
  public.court_reservations, public.court_closures, public.paddle_products,
  public.paddle_orders, public.financial_transactions
from public, anon, authenticated;

grant select on public.courts, public.venue_settings, public.paddle_products
  to anon, authenticated;
grant select on public.customer_profiles, public.booking_holds,
  public.court_reservations, public.paddle_orders to authenticated;

create policy courts_public_read on public.courts
  for select to anon, authenticated using (enabled = true);
create policy settings_public_read on public.venue_settings
  for select to anon, authenticated using (id = 1);
create policy paddle_catalog_public_read on public.paddle_products
  for select to anon, authenticated using (visible = true);

create policy customer_profile_own_read on public.customer_profiles
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy booking_hold_own_read on public.booking_holds
  for select to authenticated
  using (customer_user_id = (select auth.uid()));
create policy reservation_own_read on public.court_reservations
  for select to authenticated
  using (customer_user_id = (select auth.uid()));
create policy paddle_order_own_read on public.paddle_orders
  for select to authenticated
  using (customer_user_id = (select auth.uid()));
