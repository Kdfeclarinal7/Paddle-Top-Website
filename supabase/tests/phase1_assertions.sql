-- Phase 1 smoke/constraint checks. Run ONLY on a dedicated development DB
-- after applying the Phase 1 migration; all sample writes are rolled back.
begin;

do $phase1$
declare
  first_reservation uuid;
  second_reservation uuid;
  test_product uuid;
  test_slot timestamptz := '2035-01-02 10:00:00+08'::timestamptz;
  test_ref text := 'PHASE1-' || replace(gen_random_uuid()::text, '-', '');
begin
  if (select count(*) from public.courts) <> 4 then
    raise exception 'Expected exactly four courts';
  end if;
  if (select count(*) from public.courts
      where id in ('court-1', 'court-2', 'court-3', 'court-4')) <> 4 then
    raise exception 'Missing required court identity';
  end if;
  if not exists (select 1 from pg_constraint
    where conrelid = 'public.court_slot_claims'::regclass
      and contype in ('p', 'u')
      and pg_get_constraintdef(oid) like '%court_id, slot_start_at%') then
    raise exception 'Court-slot uniqueness missing';
  end if;
  if not exists (select 1 from pg_constraint
    where conrelid = 'public.court_slot_claims'::regclass
      and contype = 'f'
      and confrelid = 'public.courts'::regclass) then
    raise exception 'Court-slot foreign key missing';
  end if;

  insert into public.court_reservations (
    reference_code, court_id, customer_name, starts_at, ends_at,
    origin, hourly_rate_php, total_price_php
  ) values (
    test_ref || '-A', 'court-1', 'Phase 1 test', test_slot,
    test_slot + interval '1 hour', 'walk_in', 0, 0
  ) returning id into first_reservation;

  insert into public.court_reservations (
    reference_code, court_id, customer_name, starts_at, ends_at,
    origin, hourly_rate_php, total_price_php
  ) values (
    test_ref || '-B', 'court-1', 'Phase 1 test', test_slot,
    test_slot + interval '1 hour', 'walk_in', 0, 0
  ) returning id into second_reservation;

  insert into public.court_slot_claims(court_id, slot_start_at, claim_source, reservation_id)
    values ('court-1', test_slot, 'walk_in', first_reservation);

  begin
    insert into public.court_slot_claims(court_id, slot_start_at, claim_source, reservation_id)
      values ('court-1', test_slot, 'walk_in', second_reservation);
    raise exception 'Duplicate court-slot occupancy was accepted';
  exception when unique_violation then null;
  end;

  begin
    insert into public.court_slot_claims(court_id, slot_start_at, claim_source, reservation_id)
      values ('court-2', test_slot, 'reservation', gen_random_uuid());
    raise exception 'Invalid reservation foreign key was accepted';
  exception when foreign_key_violation then null;
  end;

  begin
    insert into public.court_reservations (
      reference_code, court_id, customer_name, starts_at, ends_at,
      origin, hourly_rate_php, total_price_php
    ) values (
      test_ref || '-A', 'court-2', 'Phase 1 test', test_slot,
      test_slot + interval '1 hour', 'walk_in', 0, 0
    );
    raise exception 'Duplicate booking reference was accepted';
  exception when unique_violation then null;
  end;

  insert into public.paddle_products(slug, name, stock_quantity, visible)
    values (test_ref, 'Phase 1 test product', 0, false)
    returning id into test_product;
  begin
    update public.paddle_products set stock_quantity = -1 where id = test_product;
    raise exception 'Negative stock was accepted';
  exception when check_violation then null;
  end;

  if exists (select 1 from public.venue_settings where hourly_rate_php is not null
     or opening_time is not null or closing_time is not null
     or venue_address is not null or venue_phone is not null
     or venue_email is not null or policy_text is not null) then
    raise exception 'Unconfirmed production venue values are populated';
  end if;
  raise notice 'Phase 1 smoke checks passed (transaction will roll back)';
end;
$phase1$;

rollback;
