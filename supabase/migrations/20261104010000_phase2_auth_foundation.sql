-- PADDLE TOP Phase 2: identity/authorization only.
-- Phase 1 is already hosted; never edit or recreate the Phase 1 migration.
-- No booking, inventory, payment, or admin operational write permissions.

-- Customer records are owned by auth.users.id.
-- Column-specific grants exclude changing the user_id primary key after insert.
grant insert (user_id, display_name, phone)
  on public.customer_profiles to authenticated;
grant update (display_name, phone, updated_at)
  on public.customer_profiles to authenticated;

create policy customer_profile_own_insert
  on public.customer_profiles for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy customer_profile_own_update
  on public.customer_profiles for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- The owner membership table remains completely inaccessible to client roles.
-- The SECURITY DEFINER membership lookup lives outside the exposed public API.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create function private.is_current_user_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
     and exists (
       select 1
       from public.owner_admin_users as owners
       where owners.user_id = (select auth.uid())
     );
$$;

revoke all on function private.is_current_user_owner()
  from public, anon, authenticated;
grant execute on function private.is_current_user_owner()
  to authenticated;

-- Data API exposes only a boolean RPC, never membership rows.
create function public.is_current_user_owner()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_current_user_owner();
$$;

revoke all on function public.is_current_user_owner()
  from public, anon, authenticated;
grant execute on function public.is_current_user_owner()
  to authenticated;
