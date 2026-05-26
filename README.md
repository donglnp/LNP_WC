# LNP Arena · World Cup 2026

Internal React + Supabase app: employees sign in with Google, predict every
FIFA World Cup 2026 match, and compete on a live company leaderboard.

## Stack

- Vite + React + React Router
- Tailwind CSS (dark + green "LNP Arena" theme)
- Supabase (Auth, Postgres, Realtime)
- football-data.org (or TheSportsDB) for match schedules

## Setup

```bash
npm install
cp .env.example .env  # fill in values (see below)
npm run dev
```

### 1. Supabase project

1. Create a project at <https://supabase.com>.
2. Open **SQL editor** → paste [supabase/schema.sql](./supabase/schema.sql) →
   Run. This creates:
   - `profiles` (mirror of `auth.users`, auto-populated via trigger)
   - `predictions` (per-user, per-match prediction)
   - `match_results` (admin-populated; scoring source)
   - `leaderboard` view (15 pts exact / 5 pts correct outcome)
   - RLS policies and realtime publication
3. **Project Settings → API**: copy *Project URL* + *anon/publishable key*
   into `.env`:

   ```
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon or sb_publishable_...>
   ```

### 2. Magic-link sign-in (email OTP)

No Google Cloud / Azure / 3rd-party config required. Supabase sends a one-time
sign-in link directly.

1. Supabase Dashboard → **Authentication → URL Configuration**:
   - *Site URL*: `http://localhost:5173`
   - *Redirect URLs*: add `http://localhost:5173/**` (and your production URL
     once you deploy)
2. **Authentication → Email Templates → Magic Link**: optional — tweak the
   subject/body to your liking. Default works fine.
3. (Optional but recommended) **Authentication → Providers → Email** → enable
   *"Confirm email"* if you want only verified addresses to sign in.

That's it. The "Send Magic Link" button on the login page will email a
one-click URL; clicking it from the same device drops the user into the app.

#### Limiting to your company domain (optional)

If you only want `@lnp.co` employees to sign in, add a check in the SQL
editor:

```sql
create or replace function public.enforce_company_domain()
returns trigger language plpgsql security definer as $$
begin
  if new.email !~* '@lnp\\.co$' then
    raise exception 'Only @lnp.co addresses are allowed';
  end if;
  return new;
end $$;

drop trigger if exists enforce_company_domain on auth.users;
create trigger enforce_company_domain
  before insert on auth.users
  for each row execute function public.enforce_company_domain();
```

### 3. Match data (football-data.org, optional)

football-data.org is CORS-restricted, so:

- **Dev:** put your free token in `VITE_FD_TOKEN`. Vite proxies
  `/api/fd/*` → football-data.org and injects the auth header server-side
  (see [vite.config.js](./vite.config.js)).
- **Prod:** deploy a small serverless function that proxies + adds the header,
  then set `VITE_FD_PROXY=https://your-app.com/api/fd`.

If both are absent, the app falls back to TheSportsDB (no key), then to a
bundled mock schedule.

## How scoring works

The `leaderboard` SQL view (in `schema.sql`) joins `predictions` with
`match_results`:

| Outcome | Points |
|---|---|
| Exact score match | 15 |
| Correct winner / draw | 5 |
| Wrong | 0 |

Until an admin populates `match_results`, the leaderboard ranks employees by
total points (`0`), then by exact / correct counts (`0`), then by # locked
predictions.

### Populating results

Manually as matches finish:

```sql
insert into match_results (match_id, home_score, away_score)
values ('<match_id from API>', 2, 1);
```

Or wire a small cron / edge function that pulls finished matches from
football-data.org and inserts them.

## File map

```
src/
  App.jsx                  router + auth bootstrap
  components/
    Layout.jsx             top nav (Dashboard / Matches / Leaderboard + avatar)
    FlagBadge.jsx          flag/crest renderer (emoji OR image URL)
  pages/
    Login.jsx              Google SSO button
    Dashboard.jsx          Up Next + Later Today + My Stats + Top 5
    Matches.jsx            Match Center w/ group tabs + per-match predict cards
    Leaderboard.jsx        live company leaderboard table
    Profile.jsx            accuracy donut + my prediction history
  lib/
    supabase.js            client (no-op if env missing)
    auth.js                Google OAuth + session listener
    predictions.js         CRUD + realtime + local fallback
    leaderboard.js         view query + realtime subscription
    wcApi.js               football-data → thesportsdb → mock fallback
    useWorldCup.js         module-cached hook
supabase/
  schema.sql               full schema (tables, RLS, view, trigger, realtime)
```

## Production checklist

- [ ] Run `schema.sql` in your Supabase project
- [ ] Enable Google provider + add OAuth callback URL
- [ ] Add prod origin to Supabase *Redirect URLs* allow-list
- [ ] Deploy a `/api/fd` proxy and set `VITE_FD_PROXY`
- [ ] Set up a job (manual or cron) to write into `match_results` as matches finish
