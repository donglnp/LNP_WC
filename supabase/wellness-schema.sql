-- ============================================================
-- LNP Hub — Wellness Challenge schema (run in HUB Supabase)
-- Extends public.profiles + adds public.wellness_entries.
-- Admin-only writes; everyone authenticated can read for leaderboard.
-- Photos are stored as external URLs (no Supabase Storage).
-- Idempotent — safe to re-run.
-- ============================================================

-- ---------- profile extensions ----------
alter table public.profiles
  add column if not exists gender text,
  add column if not exists is_admin boolean not null default false,
  add column if not exists joined_wellness boolean not null default true;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_gender_check'
  ) then
    alter table public.profiles
      add constraint profiles_gender_check check (gender in ('male','female') or gender is null);
  end if;
end$$;

-- Relax profile read so leaderboard can show other users' names.
drop policy if exists "read own profile" on public.profiles;
drop policy if exists "read all profiles" on public.profiles;
create policy "read all profiles"
  on public.profiles for select to authenticated using (true);

-- Admins can update any profile (set gender, toggle joined_wellness, grant admin).
drop policy if exists "admin update any profile" on public.profiles;
create policy "admin update any profile"
  on public.profiles for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true))
  with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin = true));

-- ---------- wellness_entries ----------
create table if not exists public.wellness_entries (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  entry_date      date not null,
  exercise_type   text not null check (exercise_type in ('run','walk','cycle','swim','gym','other')),
  duration_min   int  not null check (duration_min > 0 and duration_min <= 120),
  kcal            int  not null check (kcal > 0),
  device          text,
  photo_before_url text not null,
  photo_after_url  text not null,
  status          text not null default 'approved' check (status in ('pending','approved','rejected')),
  notes           text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, entry_date)
);

create index if not exists wellness_entries_user_idx on public.wellness_entries (user_id);
create index if not exists wellness_entries_date_idx on public.wellness_entries (entry_date);

alter table public.wellness_entries enable row level security;

-- All authenticated users can read approved entries (for leaderboard + their own).
drop policy if exists "read entries" on public.wellness_entries;
create policy "read entries"
  on public.wellness_entries for select to authenticated
  using (status = 'approved' or user_id = auth.uid());

-- Only admins can insert/update/delete.
drop policy if exists "admin insert entries" on public.wellness_entries;
create policy "admin insert entries"
  on public.wellness_entries for insert to authenticated
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

drop policy if exists "admin update entries" on public.wellness_entries;
create policy "admin update entries"
  on public.wellness_entries for update to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

drop policy if exists "admin delete entries" on public.wellness_entries;
create policy "admin delete entries"
  on public.wellness_entries for delete to authenticated
  using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));

-- Auto-bump updated_at.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists trg_wellness_entries_touch on public.wellness_entries;
create trigger trg_wellness_entries_touch
  before update on public.wellness_entries
  for each row execute function public.touch_updated_at();

-- Realtime (optional — leaderboard live updates).
alter publication supabase_realtime add table public.wellness_entries;

-- ---------- bootstrap first admin ----------
-- AFTER you log in once via Google, find your auth.users id and run:
--   update public.profiles set is_admin = true where email = 'your@lnp-technologies.com';
