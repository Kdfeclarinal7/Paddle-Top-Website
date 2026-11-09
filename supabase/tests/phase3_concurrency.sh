#!/usr/bin/env bash
set -euo pipefail
: "${PG_CONTAINER:?set PG_CONTAINER to the disposable PostgreSQL service container}"

psql_db() {
  docker exec -i "$PG_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d "$1"
}

# Concurrent clients need committed fixtures in their own throwaway database.
# CI tears down this database with the container, without touching Supabase.
psql_db postgres <<'SQL'
create database phase3_race template postgres;
SQL

psql_db phase3_race <<'SQL'
begin;
insert into auth.users (id) values
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
update public.venue_settings set
 hourly_rate_php=487.50, opening_time='08:00', closing_time='12:00',
 hold_duration_minutes=5
where id=1;
commit;
SQL

(
psql_db phase3_race <<'SQL'
begin;
set local role authenticated;
set local request.jwt.claim.sub='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
select public.create_booking_hold('court-1','2035-01-02','09:00','10:00');
select pg_sleep(2);
commit;
SQL
) > /tmp/phase3-race-a.log 2>&1 &
a_pid=$!

sleep 0.3
set +e
psql_db phase3_race > /tmp/phase3-race-b.log 2>&1 <<'SQL'
begin;
set local role authenticated;
set local request.jwt.claim.sub='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
select public.create_booking_hold('court-1','2035-01-02','09:00','10:00');
commit;
SQL
b_code=$?
wait "$a_pid"
a_code=$?
set -e

if ! { [[ $a_code -eq 0 && $b_code -ne 0 ]] || [[ $a_code -ne 0 && $b_code -eq 0 ]]; }; then
  echo "Expected one success and one conflict; got A=$a_code B=$b_code"
  cat /tmp/phase3-race-a.log
  cat /tmp/phase3-race-b.log
  exit 1
fi

psql_db phase3_race <<'SQL'
do $test$
declare
  v_claims integer;
  v_holds integer;
  v_slot timestamptz := (timestamp '2035-01-02 09:00' at time zone 'Asia/Manila');
begin
  select count(*) into v_claims from public.court_slot_claims
  where court_id='court-1' and slot_start_at=v_slot;
  select count(*) into v_holds from public.booking_holds
  where court_id='court-1' and starts_at=v_slot and status='active';
  if v_claims <> 1 or v_holds <> 1 then
    raise exception 'Concurrent double booking: % claims, % active holds',v_claims,v_holds;
  end if;
  raise notice 'Concurrent claim check passed: one success, one conflict';
end
$test$;
SQL
