-- ============================================================
-- LNP World Cup 2026 — Supabase schema
-- Run this once in the Supabase SQL editor (Project → SQL).
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

drop policy if exists "read all profiles" on public.profiles;
create policy "read all profiles"
  on public.profiles for select using (true);

drop policy if exists "upsert own profile" on public.profiles;
create policy "upsert own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on sign-up.
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

-- ---------- predictions ----------
create table if not exists public.predictions (
  user_id    uuid not null references auth.users (id) on delete cascade,
  match_id   text not null,
  home_score int  not null default 0,
  away_score int  not null default 0,
  locked     boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, match_id)
);

create index if not exists predictions_match_idx
  on public.predictions (match_id);

alter table public.predictions enable row level security;

drop policy if exists "read all predictions" on public.predictions;
create policy "read all predictions"
  on public.predictions for select using (true);

drop policy if exists "insert own prediction" on public.predictions;
create policy "insert own prediction"
  on public.predictions for insert with check (auth.uid() = user_id);

drop policy if exists "update own prediction" on public.predictions;
create policy "update own prediction"
  on public.predictions for update using (auth.uid() = user_id);

drop policy if exists "delete own prediction" on public.predictions;
create policy "delete own prediction"
  on public.predictions for delete using (auth.uid() = user_id);

-- ---------- match results (admin-populated) ----------
-- Used by the scoring view. Until you populate it, points are 0 and the
-- leaderboard ranks by # locked predictions.
create table if not exists public.match_results (
  match_id   text primary key,
  home_score int not null,
  away_score int not null,
  finished_at timestamptz not null default now()
);

alter table public.match_results enable row level security;

drop policy if exists "read all results" on public.match_results;
create policy "read all results"
  on public.match_results for select using (true);

-- ---------- leaderboard view ----------
-- Scoring: 15 pts exact score, 5 pts correct outcome, 0 otherwise.
create or replace view public.leaderboard as
with scored as (
  select
    p.user_id,
    case
      when r.home_score is null then 0
      when r.home_score = p.home_score and r.away_score = p.away_score then 15
      when sign(r.home_score - r.away_score) = sign(p.home_score - p.away_score) then 5
      else 0
    end as pts,
    case
      when r.home_score is null then false
      when r.home_score = p.home_score and r.away_score = p.away_score then true
      else false
    end as is_exact,
    case
      when r.home_score is null then false
      when sign(r.home_score - r.away_score) = sign(p.home_score - p.away_score) then true
      else false
    end as is_correct,
    case when p.locked then 1 else 0 end as locked_cnt
  from public.predictions p
  left join public.match_results r on r.match_id = p.match_id
)
select
  pr.id            as user_id,
  pr.full_name,
  pr.email,
  pr.avatar_url,
  coalesce(sum(s.pts), 0)::int          as total_points,
  coalesce(sum(s.is_exact::int), 0)::int   as exact_scores,
  coalesce(sum(s.is_correct::int), 0)::int as correct_results,
  coalesce(sum(s.locked_cnt), 0)::int   as locked_count
from public.profiles pr
left join scored s on s.user_id = pr.id
group by pr.id, pr.full_name, pr.email, pr.avatar_url
order by total_points desc, exact_scores desc, locked_count desc, pr.full_name;

grant select on public.leaderboard to anon, authenticated;

-- ---------- realtime ----------
alter publication supabase_realtime add table public.predictions;
alter publication supabase_realtime add table public.match_results;
