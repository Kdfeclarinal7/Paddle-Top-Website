-- PADDLE TOP Phase 3: hourly availability and authenticated temporary holds.
-- No production venue settings are seeded. No reservations or payments are created.
-- Phase 1 / 2 migrations remain immutable.
--
-- All mutations use trusted private functions with fixed search_path. Public
-- functions are narrow SECURITY INVOKER RPC entry points. No client table writes.
-- Per-court transaction advisory locks serialize hold, cleanup and release
-- operations; the court_slot_claims primary key is the final uniqueness barrier.

create or replace function private.phase3_cleanup_expired_holds(p_court_id text)
returns void
language plpgsql
volatile
security invoker
set search_path = ''
as $$
begin
  -- Caller MUST already hold the per-court transaction advisory lock.
  update public.booking_holds as h
    set status = 'expired'
    where h.court_id = p_court_id
      and h.status = 'active'
      and h.expires_at <= clock_timestamp();

  -- Never touch any reservation, walk-in or extension claim.
  delete from public.court_slot_claims as c
  using public.booking_holds as h
  where c.hold_id = h.id
    and c.court_id = p_court_id
    and c.claim_source = 'hold'
    and (h.status <> 'active' or h.expires_at <= clock_timestamp());
end;
$$;
revoke all on function private.phase3_cleanup_expired_holds(text)
  from public, anon, authenticated;

create function private.phase3_settings_ready(
  p_open time without time zone,
  p_close time without time zone,
  p_rate numeric,
  p_hold_minutes integer
)
returns boolean
language sql immutable security invoker
set search_path = ''
as $$
  select p_open is not null and p_close is not null
     and p_rate is not null and p_rate >= 0
     and p_hold_minutes is not null and p_hold_minutes > 0
     and p_close > p_open -- Phase 3 supports same-day operating hours.
     and extract(minute from p_open) = 0
     and extract(second from p_open) = 0
     and extract(minute from p_close) = 0
     and extract(second from p_close) = 0;
$$;
revoke all on function private.phase3_settings_ready(time without time zone,time without time zone,numeric,integer)
  from public, anon, authenticated;

create function private.phase3_hold_json(p_hold public.booking_holds)
returns jsonb
language sql stable security invoker
set search_path = ''
as $$
  select pg_catalog.jsonb_build_object(
    'id', p_hold.id,
    'court_id', p_hold.court_id,
    'court_name', (select c.name from public.courts as c where c.id = p_hold.court_id),
    'starts_at', p_hold.starts_at,
    'ends_at', p_hold.ends_at,
    'hourly_rate_php', p_hold.hourly_rate_php,
    'total_price_php', p_hold.total_price_php,
    'created_at', p_hold.created_at,
    'expires_at', p_hold.expires_at,
    'status', p_hold.status
  );
$$;
revoke all on function private.phase3_hold_json(public.booking_holds)
  from public, anon, authenticated;

-- Public availability mutates ONLY expired hold state through scoped cleanup.
-- A stale claim for an expired hold cannot continue blocking the slot.
create function private.phase3_get_court_availability(p_date date)
returns jsonb
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_settings public.venue_settings%rowtype;
  v_court record;
  v_slot timestamptz;
  v_start timestamptz;
  v_end timestamptz;
  v_kind text;
  v_slots jsonb;
  v_courts jsonb := '[]'::jsonb;
begin
  if p_date is null then
    raise exception 'A booking date is required';
  end if;

  select * into v_settings from public.venue_settings where id = 1;
  if not found or not private.phase3_settings_ready(
     v_settings.opening_time, v_settings.closing_time,
     v_settings.hourly_rate_php, v_settings.hold_duration_minutes) then
    return pg_catalog.jsonb_build_object(
      'configured', false, 'message', 'Online booking is not configured yet.',
      'hourly_rate_php', null, 'hold_duration_minutes', null,
      'courts', '[]'::jsonb);
  end if;

  v_start := (p_date + v_settings.opening_time) at time zone 'Asia/Manila';
  v_end := (p_date + v_settings.closing_time) at time zone 'Asia/Manila';

  for v_court in
    select id, name from public.courts where enabled = true order by display_order
  loop
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('paddle-top-court:' || v_court.id, 0));
    perform private.phase3_cleanup_expired_holds(v_court.id);
    v_slots := '[]'::jsonb;

    for v_slot in select pg_catalog.generate_series(
      v_start, v_end - interval '1 hour', interval '1 hour'
    )
    loop
      if v_slot <= clock_timestamp() then
        v_kind := 'past';
      elsif exists (
        select 1 from public.court_closures cl
        where cl.active and (cl.scope = 'all_courts' or cl.court_id = v_court.id)
          and cl.starts_at < v_slot + interval '1 hour'
          and cl.ends_at > v_slot
      ) then
        v_kind := 'booked';
      elsif exists (
        select 1 from public.court_slot_claims c
        where c.court_id = v_court.id and c.slot_start_at = v_slot
          and c.claim_source = 'hold'
      ) then
        v_kind := 'held';
      elsif exists (
        select 1 from public.court_slot_claims c
        where c.court_id = v_court.id and c.slot_start_at = v_slot
      ) then
        v_kind := 'booked';
      else
        v_kind := 'available';
      end if;

      v_slots := v_slots || pg_catalog.jsonb_build_array(
        pg_catalog.jsonb_build_object(
          'time', pg_catalog.to_char(v_slot at time zone 'Asia/Manila', 'HH24:MI'),
          'status', v_kind
        ));
    end loop;

    v_courts := v_courts || pg_catalog.jsonb_build_array(
      pg_catalog.jsonb_build_object(
        'court_id', v_court.id, 'court_name', v_court.name, 'slots', v_slots
      ));
  end loop;

  return pg_catalog.jsonb_build_object(
    'configured', true, 'message', null,
    'hourly_rate_php', v_settings.hourly_rate_php,
    'hold_duration_minutes', v_settings.hold_duration_minutes,
    'courts', v_courts
  );
end;
$$;
revoke all on function private.phase3_get_court_availability(date)
  from public, anon, authenticated;
grant execute on function private.phase3_get_court_availability(date)
  to anon, authenticated;

create function public.get_court_availability(p_date date)
returns jsonb
language sql volatile security invoker
set search_path = ''
as $$
  select private.phase3_get_court_availability(p_date);
$$;
revoke all on function public.get_court_availability(date)
  from public, anon, authenticated;
grant execute on function public.get_court_availability(date)
  to anon, authenticated;

create function private.phase3_create_booking_hold(
  p_court_id text, p_date date,
  p_start_time time without time zone,
  p_end_time time without time zone
)
returns jsonb
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_settings public.venue_settings%rowtype;
  v_court public.courts%rowtype;
  v_start timestamptz;
  v_end timestamptz;
  v_slot timestamptz;
  v_hours integer;
  v_hold public.booking_holds%rowtype;
begin
  if v_user is null then raise exception 'Sign in is required to hold a court'; end if;
  if p_court_id is null or p_date is null or p_start_time is null or p_end_time is null then
    raise exception 'Court, date, start and end time are required';
  end if;

  -- Locks the whole court, including cleanup. Future Phase 4 mutations must
  -- acquire the same lock before claiming or clearing its hourly slots.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('paddle-top-court:' || p_court_id, 0));

  select * into v_court from public.courts
   where id = p_court_id and enabled = true;
  if not found then raise exception 'Selected court is unavailable'; end if;

  select * into v_settings from public.venue_settings where id = 1;
  if not found or not private.phase3_settings_ready(
     v_settings.opening_time, v_settings.closing_time,
     v_settings.hourly_rate_php, v_settings.hold_duration_minutes) then
    raise exception 'Online booking is not configured yet.';
  end if;

  if extract(minute from p_start_time) <> 0 or extract(second from p_start_time) <> 0
    or extract(minute from p_end_time) <> 0 or extract(second from p_end_time) <> 0
    or p_end_time <= p_start_time
    or p_start_time < v_settings.opening_time
    or p_end_time > v_settings.closing_time
  then raise exception 'Select consecutive whole hours inside operating hours'; end if;

  v_start := (p_date + p_start_time) at time zone 'Asia/Manila';
  v_end := (p_date + p_end_time) at time zone 'Asia/Manila';
  v_hours := (extract(epoch from (v_end - v_start)) / 3600)::integer;

  if v_hours < 1 or v_end <> v_start + v_hours * interval '1 hour' then
    raise exception 'Booking hours must be consecutive'; end if;
  if v_start <= clock_timestamp() then raise exception 'Cannot hold a past slot'; end if;
  if v_settings.min_booking_lead_minutes is not null
    and v_start < clock_timestamp() + v_settings.min_booking_lead_minutes * interval '1 minute'
  then raise exception 'Booking lead time has not been met'; end if;
  if v_settings.max_booking_days_ahead is not null
    and p_date > (clock_timestamp() at time zone 'Asia/Manila')::date
                 + v_settings.max_booking_days_ahead
  then raise exception 'Date is outside the advance booking window'; end if;

  perform private.phase3_cleanup_expired_holds(p_court_id);

  if exists (
    select 1 from public.court_closures cl
    where cl.active and (cl.scope = 'all_courts' or cl.court_id = p_court_id)
      and cl.starts_at < v_end and cl.ends_at > v_start
  ) then raise exception 'Selected court time is closed'; end if;

  if exists (
    select 1 from public.court_slot_claims c
    where c.court_id = p_court_id
      and c.slot_start_at >= v_start and c.slot_start_at < v_end
  ) then raise exception 'Selected court time is no longer available'; end if;

  insert into public.booking_holds (
    customer_user_id, court_id, starts_at, ends_at,
    hourly_rate_php, total_price_php, expires_at
  )
  values (
    v_user, p_court_id, v_start, v_end, v_settings.hourly_rate_php,
    v_settings.hourly_rate_php * v_hours,
    clock_timestamp() + v_settings.hold_duration_minutes * interval '1 minute'
  ) returning * into v_hold;

  for v_slot in select pg_catalog.generate_series(
    v_start, v_end - interval '1 hour', interval '1 hour')
  loop
    insert into public.court_slot_claims(
      court_id, slot_start_at, claim_source, hold_id
    ) values (p_court_id, v_slot, 'hold', v_hold.id);
    -- Unique court/hour constraint rejects any conflicting concurrent claim.
    -- PostgREST rolls back the entire call if a claim insertion fails.
  end loop;

  return private.phase3_hold_json(v_hold);
end;
$$;
revoke all on function private.phase3_create_booking_hold(
  text,date,time without time zone,time without time zone)
  from public, anon, authenticated;
grant execute on function private.phase3_create_booking_hold(
  text,date,time without time zone,time without time zone)
  to authenticated;

create function public.create_booking_hold(
  p_court_id text, p_date date,
  p_start_time time without time zone,
  p_end_time time without time zone
)
returns jsonb
language sql volatile security invoker
set search_path = ''
as $$
  select private.phase3_create_booking_hold(
    p_court_id, p_date, p_start_time, p_end_time);
$$;
revoke all on function public.create_booking_hold(
  text,date,time without time zone,time without time zone)
  from public, anon, authenticated;
grant execute on function public.create_booking_hold(
  text,date,time without time zone,time without time zone)
  to authenticated;

create function private.phase3_get_active_booking_hold(p_hold_id uuid default null)
returns jsonb
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_court record;
  v_hold public.booking_holds%rowtype;
begin
  if v_user is null then raise exception 'Sign in is required'; end if;

  -- In consistent court order, clean all stale held claims; this also ensures
  -- the latest active hold lookup does not return an already expired record.
  for v_court in select id from public.courts order by display_order loop
    perform pg_catalog.pg_advisory_xact_lock(
      pg_catalog.hashtextextended('paddle-top-court:' || v_court.id, 0));
    perform private.phase3_cleanup_expired_holds(v_court.id);
  end loop;

  select * into v_hold from public.booking_holds
  where customer_user_id = v_user and status = 'active'
    and expires_at > clock_timestamp()
    and (p_hold_id is null or id = p_hold_id)
  order by created_at desc limit 1;

  if not found then return null; end if;
  return private.phase3_hold_json(v_hold);
end;
$$;
revoke all on function private.phase3_get_active_booking_hold(uuid)
  from public, anon, authenticated;
grant execute on function private.phase3_get_active_booking_hold(uuid)
  to authenticated;

create function public.get_active_booking_hold(p_hold_id uuid default null)
returns jsonb
language sql volatile security invoker
set search_path = ''
as $$
  select private.phase3_get_active_booking_hold(p_hold_id);
$$;
revoke all on function public.get_active_booking_hold(uuid)
  from public, anon, authenticated;
grant execute on function public.get_active_booking_hold(uuid)
  to authenticated;

create function private.phase3_release_booking_hold(p_hold_id uuid)
returns jsonb
language plpgsql volatile security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_court_id text;
  v_hold public.booking_holds%rowtype;
begin
  if v_user is null then raise exception 'Sign in is required'; end if;
  if p_hold_id is null then raise exception 'Hold ID is required'; end if;

  select court_id into v_court_id from public.booking_holds
  where id = p_hold_id and customer_user_id = v_user;
  if not found then return pg_catalog.jsonb_build_object('status','not_found'); end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('paddle-top-court:' || v_court_id, 0));
  perform private.phase3_cleanup_expired_holds(v_court_id);

  select * into v_hold from public.booking_holds
    where id = p_hold_id and customer_user_id = v_user for update;
  if not found then return pg_catalog.jsonb_build_object('status','not_found'); end if;

  if v_hold.status = 'active' and v_hold.expires_at > clock_timestamp() then
    delete from public.court_slot_claims
      where hold_id = v_hold.id and claim_source = 'hold';
    update public.booking_holds set status = 'released' where id = v_hold.id;
    return pg_catalog.jsonb_build_object('status','released');
  end if;
  if v_hold.status in ('released','expired') then
    return pg_catalog.jsonb_build_object('status',v_hold.status);
  end if;
  raise exception 'This hold can no longer be released';
end;
$$;
revoke all on function private.phase3_release_booking_hold(uuid)
  from public, anon, authenticated;
grant execute on function private.phase3_release_booking_hold(uuid)
  to authenticated;

create function public.release_booking_hold(p_hold_id uuid)
returns jsonb
language sql volatile security invoker
set search_path = ''
as $$
  select private.phase3_release_booking_hold(p_hold_id);
$$;
revoke all on function public.release_booking_hold(uuid)
  from public, anon, authenticated;
grant execute on function public.release_booking_hold(uuid)
  to authenticated;

-- Phase 2 already grants private schema USAGE to authenticated.
-- This one additional USAGE grant allows public availability only;
-- specific private function EXECUTE grants above still restrict actions.
grant usage on schema private to anon;
