# LNP Hub

Internal React + Supabase platform for LNP Technologies employees. One sign-in,
a catalog of mini-games:

- 💪 **Wellness Challenge** — daily workout logs, points, photo proof, live
  team leaderboard.
- ⚽ **World Cup 2026** — predict every FIFA WC 2026 match, compete on a
  company-wide leaderboard.
- 💡 **Suggest a Game** — quick mailto link for new game ideas.

UI is available in **English / Tiếng Việt / 日本語**.

## Stack

- Vite + React 19 + React Router 7
- Tailwind CSS (dark "Arena" theme)
- Supabase (Google OAuth, Postgres, RLS, Realtime)
- football-data.org → TheSportsDB → bundled mock (graceful fallback) for match
  data

## Setup

```bash
npm install
cp .env.example .env  # fill in values (see below)
npm run dev
```

### 1. Supabase project

Create a project at <https://supabase.com>, then in the **SQL editor** run the
three schema files in order:

1. [supabase/hub-schema.sql](./supabase/hub-schema.sql) — shared `profiles`
   table, auto-populated from `auth.users` via trigger, plus RLS.
2. [supabase/wc-schema.sql](./supabase/wc-schema.sql) — World Cup
   `predictions`, `match_results`, `leaderboard` view, realtime publication.
3. [supabase/wellness-schema.sql](./supabase/wellness-schema.sql) — Wellness
   Challenge `wellness_entries`, profile extensions (`gender`, `is_admin`,
   `joined_wellness`), admin-only writes, realtime.

All three are idempotent — safe to re-run.

Copy your **Project URL** + **anon/publishable key** into `.env`:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon or sb_publishable_...>
```

### 2. Google sign-in

The app uses Google OAuth (not magic link).

1. Google Cloud Console → create an OAuth 2.0 Client ID (Web application).
   - Authorized JavaScript origins: `http://localhost:5173`, your prod URL.
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`.
2. Supabase Dashboard → **Authentication → Providers → Google**: paste Client
   ID + Client Secret, enable.
3. **Authentication → URL Configuration**:
   - *Site URL*: `http://localhost:5173`
   - *Redirect URLs*: add `http://localhost:5173/**` and your production URL.

#### Limit to your company domain (optional)

```sql
create or replace function public.enforce_company_domain()
returns trigger language plpgsql security definer as $$
begin
  if new.email !~* '@lnp-technologies\.com$' then
    raise exception 'Only @lnp-technologies.com addresses are allowed';
  end if;
  return new;
end $$;

drop trigger if exists enforce_company_domain on auth.users;
create trigger enforce_company_domain
  before insert on auth.users
  for each row execute function public.enforce_company_domain();
```

### 3. Bootstrap the first admin

After signing in once via Google, promote yourself in the SQL editor:

```sql
update public.profiles set is_admin = true
 where email = 'you@lnp-technologies.com';
```

Admins get access to `/admin` (manage users, log wellness entries on behalf of
employees, etc.).

### 4. Match data (World Cup, optional)

football-data.org is CORS-restricted, so:

- **Dev:** put your free token in `VITE_FD_TOKEN`. Vite proxies `/api/fd/*` →
  football-data.org and injects the auth header server-side
  (see [vite.config.js](./vite.config.js)).
- **Prod:** the bundled Edge function [api/fd/[...path].js](./api/fd/) does the
  same on Vercel; set `FD_TOKEN` (server-only, no `VITE_` prefix).

If both are absent, the app falls back to TheSportsDB (no key), then to a
bundled mock schedule.

## Games

### Wellness Challenge

- Employees join via a flag on their profile (`joined_wellness`).
- Admin logs one entry per user per day with: exercise type, duration, kcal,
  device, before/after photo URLs, optional notes.
- Custom names supported when type/device is `"other"`.
- Guest entries: admins can log for an email before the user has ever signed
  in — once they sign in with that email, the entries auto-link.
- Pages: Dashboard / History / Leaderboard / Rules.

### World Cup 2026

Scoring (see [supabase/wc-schema.sql](./supabase/wc-schema.sql)
`leaderboard` view):

| Outcome | Points |
|---|---|
| Exact score match | 15 |
| Correct winner / draw | 5 |
| Wrong | 0 |

Populate results manually as matches finish:

```sql
insert into match_results (match_id, home_score, away_score)
values ('<match_id from API>', 2, 1);
```

Or wire a cron / edge function that pulls finished matches from
football-data.org.

## File map

```
src/
  App.jsx                         router + auth bootstrap
  components/
    GameCard.jsx                  catalog card
    LanguageSwitcher.jsx          EN / VI / JA toggle
    ProtectedRoute.jsx            requires session
    AdminRoute.jsx                requires is_admin
    Skeleton.jsx
  pages/
    Login.jsx                     Google SSO button
    Catalog.jsx                   home / game picker
    Admin.jsx                     admin console
  lib/
    AuthContext.jsx               session + isAdmin context
    auth.js                       Google OAuth + sign-out
    supabaseHub.js                Supabase client
    i18n.jsx                      EN / VI / JA dictionary + hook
  games/
    wc/                           World Cup game (pages, lib, components)
    wellness-challenge/           Wellness game (pages, lib, components)
supabase/
  hub-schema.sql                  profiles + shared RLS
  wc-schema.sql                   World Cup tables + leaderboard view
  wellness-schema.sql             Wellness entries + profile ext
api/
  fd/[...path].js                 Vercel Edge proxy for football-data.org
```

## Deploy to Vercel

The repo ships everything Vercel needs:

- `api/fd/[...path].js` — Edge function that proxies `/api/fd/*` to
  football-data.org with the `X-Auth-Token` header (token stays server-side).
- `vercel.json` — SPA rewrites so deep links (`/wc`, `/wellness-challenge`,
  `/admin`, …) hit `index.html` and React Router takes over.

### Steps

1. **Push to GitHub**, then import the repo on Vercel
   (<https://vercel.com/new>). Vercel auto-detects Vite.

2. **Set environment variables** (Project Settings → Environment Variables):

   | Name | Value | Scope |
   |---|---|---|
   | `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` | Production, Preview |
   | `VITE_SUPABASE_ANON_KEY` | publishable / anon key | Production, Preview |
   | `FD_TOKEN` | football-data.org token (server-side only) | Production, Preview |

   Notes:
   - `VITE_*` vars are inlined at build time (safe = anon key only).
   - `FD_TOKEN` is **not** `VITE_*` — only the serverless function reads it,
     so it never reaches the browser.
   - Override `VITE_FD_PROXY` only if you host the proxy elsewhere.

3. **Add the production URL to Supabase** → Authentication → URL Configuration:
   - Site URL: `https://<your-app>.vercel.app`
   - Redirect URLs: add `https://<your-app>.vercel.app/**`
   - And register the same URL in Google Cloud Console as an authorized origin.

4. **Deploy.** Done.

## Production checklist

- [ ] Push to GitHub + import to Vercel
- [ ] Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `FD_TOKEN` on Vercel
- [ ] Run `hub-schema.sql`, `wc-schema.sql`, `wellness-schema.sql` in Supabase
- [ ] Configure Google OAuth provider in Supabase + Google Cloud Console
- [ ] Add the Vercel URL to Supabase *Site URL* + *Redirect URLs*
- [ ] Promote at least one `profiles.is_admin = true`
- [ ] (Optional) cron / edge function to write into `match_results` as WC matches finish
