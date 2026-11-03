-- Phase 2: isolated PostgreSQL 17 RLS smoke tests.
-- The test runner must supply auth.users, auth.uid() reading
-- request.jwt.claim.sub, and the anon/authenticated roles.
-- NEVER run this fixture on hosted Supabase: inserts into auth.users.
begin;
insert into auth.users(id) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'),
  ('cccccccc-cccc-4ccc-8ccc-cccccccccccc');

insert into public.customer_profiles(user_id, display_name) values
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Other person');
insert into public.owner_admin_users(user_id)
  values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc');

-- Static grants and RLS policy boundary.
do $tests$
begin
  if has_table_privilege('anon', 'public.customer_profiles', 'select') then
    raise exception 'Anonymous profile SELECT unexpectedly granted';
  end if;
  if has_table_privilege('authenticated', 'public.owner_admin_users', 'select') then
    raise exception 'Authenticated membership SELECT unexpectedly granted';
  end if;
  if has_table_privilege('authenticated', 'public.owner_admin_users', 'insert') then
    raise exception 'Authenticated membership INSERT unexpectedly granted';
  end if;
  if has_table_privilege('authenticated', 'public.booking_holds', 'insert') then
    raise exception 'Phase 2 introduced booking writes';
  end if;
  if has_function_privilege('anon', 'public.is_current_user_owner()', 'execute') then
    raise exception 'Anonymous owner helper EXECUTE unexpectedly granted';
  end if;
  if not has_function_privilege('authenticated', 'public.is_current_user_owner()', 'execute') then
    raise exception 'Owner check inaccessible to authenticated users';
  end if;
  if has_column_privilege('authenticated','public.customer_profiles','user_id','update') then
    raise exception 'Profile ownership column is updateable';
  end if;
end
$tests$;

set local role anon;
do $tests$
begin
  begin
    perform count(*) from public.customer_profiles;
    raise exception 'Anonymous profile read unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.is_current_user_owner();
    raise exception 'Anonymous owner check unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end
$tests$;
reset role;

set local role authenticated;
set local request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
do $tests$
declare
  profiles_count integer;
begin
  select count(*) into profiles_count from public.customer_profiles;
  if profiles_count <> 0 then
    raise exception 'Customer can see someone else profile';
  end if;

  insert into public.customer_profiles(user_id, display_name, phone)
  values ((select auth.uid()), 'Customer', 'not-a-real-number');

  select count(*) into profiles_count
    from public.customer_profiles where user_id = (select auth.uid());
  if profiles_count <> 1 then
    raise exception 'Customer cannot read own profile';
  end if;

  update public.customer_profiles set display_name='Changed by owner'
    where user_id = (select auth.uid());
  if (select display_name from public.customer_profiles
      where user_id = (select auth.uid())) <> 'Changed by owner' then
    raise exception 'Customer cannot update own profile';
  end if;

  begin
    insert into public.customer_profiles(user_id, display_name)
    values ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Impersonation');
    raise exception 'Customer inserted a different user_id';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.customer_profiles
       set user_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
     where user_id = (select auth.uid());
    raise exception 'Customer changed profile ownership';
  exception when insufficient_privilege then null;
  end;

  begin
    perform count(*) from public.owner_admin_users;
    raise exception 'Customer read the owner membership list';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.owner_admin_users(user_id) values ((select auth.uid()));
    raise exception 'Customer granted themselves owner rights';
  exception when insufficient_privilege then null;
  end;

  if public.is_current_user_owner() then
    raise exception 'Normal customer was recognized as owner';
  end if;
end
$tests$;

set local request.jwt.claim.sub = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
do $tests$
begin
  if not public.is_current_user_owner() then
    raise exception 'Provisioned owner was not recognized';
  end if;
end
$tests$;

reset role;
rollback;
