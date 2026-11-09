-- Phase 3 SQL assertions. DISPOSABLE PostgreSQL ONLY.
-- All venue settings, fake auth users, holds, claims and reservations roll back.
begin;

insert into auth.users(id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

do $test$
declare
  v_availability jsonb;
begin
  v_availability := public.get_court_availability(
    (clock_timestamp() at time zone 'Asia/Manila')::date + 3);
  if v_availability->>'configured' <> 'false'
    or (v_availability->>'hourly_rate_php') is not null
    or jsonb_array_length(v_availability->'courts') <> 0
  then raise exception 'Missing settings did not return not-configured'; end if;
end;
$test$;

set local role anon;
do $test$
declare v_availability jsonb;
begin
  v_availability := public.get_court_availability(
    (clock_timestamp() at time zone 'Asia/Manila')::date + 3);
  if v_availability->>'configured' <> 'false' then
    raise exception 'Anonymous availability failed'; end if;
  if has_function_privilege('anon','public.create_booking_hold(text,date,time without time zone,time without time zone)','EXECUTE')
  then raise exception 'Anonymous user can execute create hold'; end if;
  if has_function_privilege('anon','public.release_booking_hold(uuid)','EXECUTE')
  then raise exception 'Anonymous user can execute release'; end if;
end;
$test$;
reset role;

update public.venue_settings set
 opening_time='08:00', closing_time='12:00',
 hourly_rate_php=487.50, hold_duration_minutes=5,
 max_booking_days_ahead=14, min_booking_lead_minutes=0
where id=1;

set local role anon;
do $test$
declare
  v_availability jsonb;
  v_court jsonb;
  v_date date := (clock_timestamp() at time zone 'Asia/Manila')::date + 3;
begin
  v_availability := public.get_court_availability(v_date);
  if v_availability->>'configured' <> 'true' then
    raise exception 'Availability did not become configured'; end if;
  if jsonb_array_length(v_availability->'courts') <> 4 then
    raise exception 'Expected four available courts'; end if;
  if (v_availability->>'hourly_rate_php')::numeric <> 487.50 then
    raise exception 'Availability rate differs from venue settings'; end if;
  for v_court in select value from jsonb_array_elements(v_availability->'courts') loop
    if jsonb_array_length(v_court->'slots') <> 4
       or v_court->'slots'->0->>'time' <> '08:00'
       or v_court->'slots'->3->>'time' <> '11:00' then
      raise exception 'Operating hours / slots differ from settings'; end if;
  end loop;
end;
$test$;
reset role;

set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
do $test$
declare
  v_date date := (clock_timestamp() at time zone 'Asia/Manila')::date + 3;
  v_hold jsonb;
  v_id uuid;
  v_rejected boolean;
begin
  v_hold := public.create_booking_hold('court-1',v_date,'09:00','11:00');
  v_id := (v_hold->>'id')::uuid;
  perform set_config('phase3.test_hold_id',v_id::text,true);
  if (v_hold->>'total_price_php')::numeric <> 975.00
     or (v_hold->>'hourly_rate_php')::numeric <> 487.50 then
    raise exception 'Price is not derived from authoritative venue settings'; end if;
  if public.get_active_booking_hold(v_id)->>'id' <> v_id::text then
    raise exception 'Own hold lookup failed'; end if;

  v_rejected := false;
  begin perform public.create_booking_hold('court-1',v_date,'10:00','12:00');
  exception when others then v_rejected := true; end;
  if not v_rejected then raise exception 'Occupied slot accepted'; end if;

  v_rejected := false;
  begin perform public.create_booking_hold('court-1',v_date,'08:30','09:30');
  exception when others then v_rejected := true; end;
  if not v_rejected then raise exception 'Fractional hours accepted'; end if;

  v_rejected := false;
  begin perform public.create_booking_hold('court-1',v_date,'11:00','09:00');
  exception when others then v_rejected := true; end;
  if not v_rejected then raise exception 'Reverse/nonconsecutive interval accepted'; end if;

  v_rejected := false;
  begin perform public.create_booking_hold('court-1',v_date,'07:00','08:00');
  exception when others then v_rejected := true; end;
  if not v_rejected then raise exception 'Outside operating hours accepted'; end if;

  v_rejected := false;
  begin perform public.create_booking_hold(
    'court-1',(clock_timestamp() at time zone 'Asia/Manila')::date - 1,
    '09:00','10:00');
  exception when others then v_rejected := true; end;
  if not v_rejected then raise exception 'Past date accepted'; end if;

  v_rejected := false;
  begin perform public.create_booking_hold(
    'court-1',(clock_timestamp() at time zone 'Asia/Manila')::date + 20,
    '09:00','10:00');
  exception when others then v_rejected := true; end;
  if not v_rejected then raise exception 'Booking window ignored'; end if;
end;
$test$;

-- Another account cannot observe or release the first customer's hold.
set local request.jwt.claim.sub = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
do $test$
declare
  v_id uuid := current_setting('phase3.test_hold_id')::uuid;
begin
  if public.get_active_booking_hold(v_id) is not null then
    raise exception 'Another customer read someone else hold'; end if;
  if public.release_booking_hold(v_id)->>'status' <> 'not_found' then
    raise exception 'Another customer could release hold'; end if;
end;
$test$;
reset role;

do $test$
declare v_id uuid := current_setting('phase3.test_hold_id')::uuid;
begin
  if (select count(*) from public.court_slot_claims where hold_id=v_id) <> 2 then
    raise exception 'Hold claim count / other user isolation failed'; end if;
  if has_table_privilege('authenticated','public.court_slot_claims','INSERT') then
    raise exception 'Direct claim insert grant exists'; end if;
end;
$test$;

-- Simulate a reservation claim (fixture only; no Phase 3 reservation API).
insert into public.court_reservations(
 reference_code,court_id,customer_name,starts_at,ends_at,
 origin,hourly_rate_php,total_price_php
) values (
 'PHASE3-RESERVATION-ONLY','court-2','SQL fixture',
 (((clock_timestamp() at time zone 'Asia/Manila')::date+3)+time '09:00') at time zone 'Asia/Manila',
 (((clock_timestamp() at time zone 'Asia/Manila')::date+3)+time '10:00') at time zone 'Asia/Manila',
 'walk_in',487.50,487.50
);
insert into public.court_slot_claims(court_id,slot_start_at,claim_source,reservation_id)
select 'court-2', starts_at,'reservation',id
from public.court_reservations where reference_code='PHASE3-RESERVATION-ONLY';

-- Expire the first hold by moving its timestamps, leaving its two stale claims.
update public.booking_holds set
 created_at = clock_timestamp() - interval '2 hours',
 expires_at = clock_timestamp() - interval '1 hour'
where id = current_setting('phase3.test_hold_id')::uuid;

set local role anon;
do $test$
declare
  v_availability jsonb;
  v_court1 jsonb;
  v_court2 jsonb;
begin
  v_availability := public.get_court_availability(
    (clock_timestamp() at time zone 'Asia/Manila')::date + 3);
  select value into v_court1 from jsonb_array_elements(v_availability->'courts')
  where value->>'court_id'='court-1';
  select value into v_court2 from jsonb_array_elements(v_availability->'courts')
  where value->>'court_id'='court-2';
  if v_court1->'slots'->1->>'status' <> 'available'
    or v_court1->'slots'->2->>'status' <> 'available' then
    raise exception 'Expired claims still block availability'; end if;
  if v_court2->'slots'->1->>'status' <> 'booked' then
    raise exception 'Reservation claim no longer blocks availability'; end if;
end;
$test$;
reset role;

do $test$
declare v_id uuid := current_setting('phase3.test_hold_id')::uuid;
begin
  if (select status from public.booking_holds where id=v_id) <> 'expired' then
    raise exception 'Expired hold was not marked expired'; end if;
  if exists(select 1 from public.court_slot_claims where hold_id=v_id) then
    raise exception 'Expired hold claims not cleaned up'; end if;
  if not exists(select 1 from public.court_slot_claims where claim_source='reservation'
      and court_id='court-2') then
    raise exception 'Cleanup deleted a reservation claim'; end if;
end;
$test$;

set local role authenticated;
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
do $test$
declare
  v_date date := (clock_timestamp() at time zone 'Asia/Manila')::date + 3;
  v_hold jsonb;
  v_id uuid;
begin
  v_hold:=public.create_booking_hold('court-1',v_date,'11:00','12:00');
  v_id:=(v_hold->>'id')::uuid;
  if public.release_booking_hold(v_id)->>'status'<>'released' then
    raise exception 'Release failed'; end if;
  if public.release_booking_hold(v_id)->>'status'<>'released' then
    raise exception 'Repeated release not idempotent'; end if;
  perform set_config('phase3.released_hold_id', v_id::text,true);
end;
$test$;
reset role;

do $test$
declare v_id uuid := current_setting('phase3.released_hold_id')::uuid;
begin
  if exists(select 1 from public.court_slot_claims where hold_id=v_id) then
    raise exception 'Release left claims behind'; end if;
  if (select status from public.booking_holds where id=v_id) <> 'released' then
    raise exception 'Released hold status not persisted'; end if;
end;
$test$;

rollback;
