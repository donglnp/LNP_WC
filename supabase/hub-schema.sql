-- ============================================================
-- LNP Arena — HUB Supabase schema
-- Auth + shared user profile + game catalog.
-- Run this in the HUB Supabase project (SQL editor).
-- Each mini-game has its own Supabase project with its own schema
-- (e.g. supabase/wc-schema.sql for the World Cup game).
-- ============================================================

-- ---------- profiles (mirror of auth.users) ----------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "upsert own profile" on public.profiles;
create policy "upsert own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    email      = excluded.email,
    full_name  = excluded.full_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- games (catalog) ----------
create table if not exists public.games (
  slug        text primary key,
  name        text not null,
  description text,
  icon        text,
  path        text not null,
  accent      text default 'green',
  enabled     boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.games enable row level security;

drop policy if exists "read games" on public.games;
create policy "read games"
  on public.games for select to authenticated using (true);

-- seed initial catalog
insert into public.games (slug, name, description, icon, path, accent, sort_order, enabled)
values
  ('wc', 'World Cup 2026',
   'Predict every FIFA World Cup 2026 match and climb the company leaderboard.',
   '⚽', '/wc', 'green', 10, true),
  ('wellness-challenge', 'Wellness Challenge',
   'Daily wellness check-ins and team-based challenges.',
   '💪', '/wellness-challenge', 'amber', 20, false)
on conflict (slug) do nothing;
