create or replace function public.is_workspace_admin(p_workspace_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1 from public.workspace_members m
    where m.workspace_id = p_workspace_id
      and m.email = lower(((select auth.jwt()) ->> 'email'))
      and m.role = 'owner'
  );
$function$;

revoke all on function public.is_workspace_admin(text) from public, anon;
grant execute on function public.is_workspace_admin(text) to authenticated;

drop policy if exists "Admins can read workspace memberships" on public.workspace_members;
create policy "Admins can read workspace memberships"
on public.workspace_members for select to authenticated
using (public.is_workspace_admin(workspace_id));

create or replace function public.upsert_workspace_member(p_email text, p_role text)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  normalized_email text := lower(btrim(coalesce(p_email, '')));
  previous_role text;
  admin_count bigint;
begin
  lock table public.workspace_members in share row exclusive mode;
  if not public.is_workspace_admin('cad-norte') then
    raise exception 'Only workspace admins can manage members.' using errcode = '42501';
  end if;
  if normalized_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'Enter a valid email address.' using errcode = '22023';
  end if;
  if p_role is null or p_role not in ('owner', 'trainer', 'viewer') then
    raise exception 'Role must be owner, trainer, or viewer.' using errcode = '22023';
  end if;

  select m.role into previous_role
  from public.workspace_members m
  where m.workspace_id = 'cad-norte' and m.email = normalized_email;
  if previous_role = 'owner' and p_role <> 'owner' then
    select count(*) into admin_count
    from public.workspace_members m
    where m.workspace_id = 'cad-norte' and m.role = 'owner';
    if admin_count <= 1 then
      raise exception 'The last admin cannot be removed or demoted.' using errcode = '23514';
    end if;
  end if;

  insert into public.workspace_members (workspace_id, email, role)
  values ('cad-norte', normalized_email, p_role)
  on conflict (workspace_id, email) do update set role = excluded.role;
end;
$function$;

create or replace function public.remove_workspace_member(p_email text)
returns void
language plpgsql
security definer
set search_path = ''
as $function$
declare
  normalized_email text := lower(btrim(coalesce(p_email, '')));
  target_role text;
  admin_count bigint;
begin
  lock table public.workspace_members in share row exclusive mode;
  if not public.is_workspace_admin('cad-norte') then
    raise exception 'Only workspace admins can manage members.' using errcode = '42501';
  end if;

  select m.role into target_role
  from public.workspace_members m
  where m.workspace_id = 'cad-norte' and m.email = normalized_email;

  if target_role = 'owner' then
    select count(*) into admin_count
    from public.workspace_members m
    where m.workspace_id = 'cad-norte' and m.role = 'owner';
    if admin_count <= 1 then
      raise exception 'The last admin cannot be removed or demoted.' using errcode = '23514';
    end if;
  end if;

  delete from public.workspace_members
  where workspace_id = 'cad-norte' and email = normalized_email;
end;
$function$;

revoke all on function public.upsert_workspace_member(text, text) from public, anon;
revoke all on function public.remove_workspace_member(text) from public, anon;
grant execute on function public.upsert_workspace_member(text, text) to authenticated;
grant execute on function public.remove_workspace_member(text) to authenticated;
