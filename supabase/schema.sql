-- Shared CAD Norte workspace schema for the Vite app.
-- The project is a single team workspace. Add approved lower-case emails to
-- public.workspace_members from the Supabase SQL editor; do not add public data policies.

create table public.workspace_members (
  workspace_id text not null,
  email text not null,
  role text not null check (role in ('owner', 'trainer', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, email),
  constraint workspace_members_email_lowercase check (email = lower(email))
);

create table public.workspace_sync_state (
  workspace_id text primary key,
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now()
);

create table public.workspace_seasons (
  workspace_id text not null,
  id text not null,
  season text not null,
  competition text not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, id)
);

create table public.workspace_players (
  workspace_id text not null,
  season_id text not null,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, season_id, id),
  foreign key (workspace_id, season_id) references public.workspace_seasons (workspace_id, id) on delete cascade
);

create table public.workspace_sessions (
  workspace_id text not null,
  season_id text not null,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (workspace_id, season_id, id),
  foreign key (workspace_id, season_id) references public.workspace_seasons (workspace_id, id) on delete cascade
);

insert into public.workspace_sync_state (workspace_id, revision) values ('cad-norte', 0);
insert into public.workspace_seasons (workspace_id, id, season, competition)
values ('cad-norte', 'season-2026-2027-la-liga-argentina', '2026-2027', 'La Liga Argentina');

alter table public.workspace_members enable row level security;
alter table public.workspace_sync_state enable row level security;
alter table public.workspace_seasons enable row level security;
alter table public.workspace_players enable row level security;
alter table public.workspace_sessions enable row level security;

revoke all on public.workspace_members, public.workspace_sync_state, public.workspace_seasons, public.workspace_players, public.workspace_sessions from anon, public;
grant usage on schema public to authenticated;
grant select on public.workspace_members to authenticated;
grant select, update on public.workspace_sync_state to authenticated;
grant select, insert, update, delete on public.workspace_seasons, public.workspace_players, public.workspace_sessions to authenticated;

create policy "Members can read own membership"
on public.workspace_members for select to authenticated
using (email = lower(((select auth.jwt()) ->> 'email')));

create policy "Workspace members can read sync state"
on public.workspace_sync_state for select to authenticated
using (exists (
  select 1 from public.workspace_members m
  where m.workspace_id = workspace_sync_state.workspace_id
    and m.email = lower(((select auth.jwt()) ->> 'email'))
));

create policy "Workspace members can update sync state"
on public.workspace_sync_state for update to authenticated
using (exists (
  select 1 from public.workspace_members m
  where m.workspace_id = workspace_sync_state.workspace_id
    and m.email = lower(((select auth.jwt()) ->> 'email'))
    and m.role in ('owner', 'trainer')
))
with check (exists (
  select 1 from public.workspace_members m
  where m.workspace_id = workspace_sync_state.workspace_id
    and m.email = lower(((select auth.jwt()) ->> 'email'))
    and m.role in ('owner', 'trainer')
));

create policy "Workspace members can read seasons"
on public.workspace_seasons for select to authenticated
using (exists (
  select 1 from public.workspace_members m
  where m.workspace_id = workspace_seasons.workspace_id
    and m.email = lower(((select auth.jwt()) ->> 'email'))
));

create policy "Workspace members can manage seasons"
on public.workspace_seasons for all to authenticated
using (exists (
  select 1 from public.workspace_members m
  where m.workspace_id = workspace_seasons.workspace_id
    and m.email = lower(((select auth.jwt()) ->> 'email'))
    and m.role in ('owner', 'trainer')
))
with check (exists (
  select 1 from public.workspace_members m
  where m.workspace_id = workspace_seasons.workspace_id
    and m.email = lower(((select auth.jwt()) ->> 'email'))
    and m.role in ('owner', 'trainer')
));

create policy "Workspace members can read players"
on public.workspace_players for select to authenticated
using (exists (
  select 1 from public.workspace_members m
  where m.workspace_id = workspace_players.workspace_id
    and m.email = lower(((select auth.jwt()) ->> 'email'))
));

create policy "Workspace members can manage players"
on public.workspace_players for all to authenticated
using (exists (
  select 1 from public.workspace_members m
  where m.workspace_id = workspace_players.workspace_id
    and m.email = lower(((select auth.jwt()) ->> 'email'))
    and m.role in ('owner', 'trainer')
))
with check (exists (
  select 1 from public.workspace_members m
  where m.workspace_id = workspace_players.workspace_id
    and m.email = lower(((select auth.jwt()) ->> 'email'))
    and m.role in ('owner', 'trainer')
));

create policy "Workspace members can read sessions"
on public.workspace_sessions for select to authenticated
using (exists (
  select 1 from public.workspace_members m
  where m.workspace_id = workspace_sessions.workspace_id
    and m.email = lower(((select auth.jwt()) ->> 'email'))
));

create policy "Workspace members can manage sessions"
on public.workspace_sessions for all to authenticated
using (exists (
  select 1 from public.workspace_members m
  where m.workspace_id = workspace_sessions.workspace_id
    and m.email = lower(((select auth.jwt()) ->> 'email'))
    and m.role in ('owner', 'trainer')
))
with check (exists (
  select 1 from public.workspace_members m
  where m.workspace_id = workspace_sessions.workspace_id
    and m.email = lower(((select auth.jwt()) ->> 'email'))
    and m.role in ('owner', 'trainer')
));

create or replace function public.save_workspace_snapshot(
  p_seasons jsonb,
  p_players jsonb,
  p_sessions jsonb,
  p_expected_revision bigint
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  next_revision bigint;
begin
  update public.workspace_sync_state
  set revision = revision + 1, updated_at = clock_timestamp()
  where workspace_id = 'cad-norte' and revision = p_expected_revision
  returning revision into next_revision;

  if next_revision is null then
    raise exception 'Shared data changed in another session. Reload before saving.'
      using errcode = '40001';
  end if;

  delete from public.workspace_sessions where workspace_id = 'cad-norte';
  delete from public.workspace_players where workspace_id = 'cad-norte';
  delete from public.workspace_seasons where workspace_id = 'cad-norte';

  insert into public.workspace_seasons (workspace_id, id, season, competition)
  select 'cad-norte', item->>'id', item->>'season', item->>'competition'
  from jsonb_array_elements(coalesce(p_seasons, '[]'::jsonb)) as item;

  insert into public.workspace_players (workspace_id, season_id, id, data)
  select 'cad-norte', item->>'seasonId', item->>'id', item
  from jsonb_array_elements(coalesce(p_players, '[]'::jsonb)) as item;

  insert into public.workspace_sessions (workspace_id, season_id, id, data)
  select 'cad-norte', item->>'seasonId', item->>'id', item
  from jsonb_array_elements(coalesce(p_sessions, '[]'::jsonb)) as item;

  return next_revision;
end;
$function$;

revoke all on function public.save_workspace_snapshot(jsonb, jsonb, jsonb, bigint) from public, anon;
grant execute on function public.save_workspace_snapshot(jsonb, jsonb, jsonb, bigint) to authenticated;
