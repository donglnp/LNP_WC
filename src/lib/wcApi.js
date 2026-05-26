// Live World Cup data layer.
//
// Order of preference:
//   1. football-data.org — needs free token in VITE_FD_TOKEN
//   2. TheSportsDB v1 free (no key)
//   3. Static MOCK_* fallback bundled in mockData.js
//
// All loaders normalize results to the shape the UI components already expect:
//   Team:   { code, name, flag }
//   Match:  { id, group, home, away, kickoff, status, prediction? }
//
// Predictions are user-specific and still mocked locally — they don't come from
// the public API. They live in localStorage until you point them at Supabase.

import { MATCHES as MOCK_MATCHES, TEAMS as MOCK_TEAMS } from "./mockData";

// /api/fd is served by:
//   - dev:  Vite proxy in vite.config.js (uses VITE_FD_TOKEN locally)
//   - prod: Vercel function api/fd/[...path].js (uses FD_TOKEN server-side)
// In both cases the token never reaches the browser bundle. Override the
// proxy URL with VITE_FD_PROXY if you host the function elsewhere.
const FD_PROXY = import.meta.env.VITE_FD_PROXY || "/api/fd";
// Try football-data unless explicitly disabled (e.g. dev without a token).
// On a 5xx from the proxy (no token configured), we silently fall through to
// TheSportsDB and then mock.
const FD_ENABLED = import.meta.env.DEV
  ? Boolean(import.meta.env.VITE_FD_TOKEN)
  : true;
const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

const FLAG_BY_CODE = {
  ARG: "🇦🇷", BRA: "🇧🇷", FRA: "🇫🇷", ENG: "🏴", ESP: "🇪🇸", GER: "🇩🇪",
  POR: "🇵🇹", NED: "🇳🇱", BEL: "🇧🇪", ITA: "🇮🇹", CRO: "🇭🇷", URU: "🇺🇾",
  USA: "🇺🇸", MEX: "🇲🇽", CAN: "🇨🇦", JPN: "🇯🇵", KOR: "🇰🇷", MAR: "🇲🇦",
  SEN: "🇸🇳", AUS: "🇦🇺", SUI: "🇨🇭", DEN: "🇩🇰", POL: "🇵🇱", ECU: "🇪🇨",
  SRB: "🇷🇸", GHA: "🇬🇭",
};

function flagFor(code) {
  return FLAG_BY_CODE[code?.toUpperCase()] || "🏳️";
}

function toCode(s, fallback = "") {
  return (s || fallback || "").slice(0, 3).toUpperCase();
}

// ────────────────────────────────────────────────────────────
// football-data.org
// ────────────────────────────────────────────────────────────
async function fdFetch(path) {
  // No client-side header — the dev proxy (or your prod proxy) injects the
  // X-Auth-Token server-side. Keeps the token out of the browser bundle.
  const res = await fetch(`${FD_PROXY}${path}`);
  if (!res.ok) throw new Error(`football-data ${res.status}`);
  return res.json();
}

async function fdLoadTeams() {
  const json = await fdFetch("/competitions/WC/teams");
  return (json.teams || []).map((t) => ({
    code: toCode(t.tla, t.shortName),
    name: t.shortName || t.name,
    flag: t.crest || flagFor(t.tla),
    apiId: t.id,
    apiSource: "fd",
  }));
}

async function fdLoadMatches() {
  const json = await fdFetch("/competitions/WC/matches");
  return (json.matches || []).map((m) => ({
    id: String(m.id),
    stage: m.stage || "GROUP_STAGE",
    group: (m.group || m.stage || "").replace("GROUP_", "") || "—",
    home: toCode(m.homeTeam?.tla, m.homeTeam?.shortName),
    away: toCode(m.awayTeam?.tla, m.awayTeam?.shortName),
    homeApiId: m.homeTeam?.id,
    awayApiId: m.awayTeam?.id,
    kickoff: m.utcDate,
    status: mapFdStatus(m.status),
    score:
      m.score?.fullTime?.home != null
        ? { home: m.score.fullTime.home, away: m.score.fullTime.away }
        : null,
  }));
}

function mapFdStatus(s) {
  if (s === "FINISHED") return "finished";
  if (s === "IN_PLAY" || s === "PAUSED" || s === "LIVE") return "live";
  return "upcoming";
}

// ────────────────────────────────────────────────────────────
// TheSportsDB (no key, best-effort)
// ────────────────────────────────────────────────────────────
async function sdbLoadTeams() {
  const res = await fetch(
    `${SPORTSDB_BASE}/search_all_teams.php?l=FIFA%20World%20Cup`
  );
  if (!res.ok) throw new Error("thesportsdb teams " + res.status);
  const json = await res.json();
  if (!Array.isArray(json.teams)) throw new Error("no teams");
  return json.teams
    .map((t) => ({
      code: toCode(t.strTeamShort || t.strTeam),
      name: t.strTeam,
      flag: t.strTeamBadge || flagFor(t.strTeamShort),
      apiId: t.idTeam,
      apiSource: "sdb",
    }))
    .filter((t) => t.code && t.name);
}

async function sdbLoadMatches() {
  // Season filter that returns FIFA WC 2026 schedule when published.
  const res = await fetch(
    `${SPORTSDB_BASE}/eventsseason.php?id=4429&s=2026`
  );
  if (!res.ok) throw new Error("thesportsdb matches " + res.status);
  const json = await res.json();
  if (!Array.isArray(json.events)) throw new Error("no events");
  return json.events.map((e) => ({
    id: e.idEvent,
    stage: e.strGroup ? "GROUP_STAGE" : `ROUND_${e.strRound || "?"}`,
    group: e.strGroup || (e.strRound ? `R${e.strRound}` : "—"),
    home: toCode(e.strHomeTeamShort || e.strHomeTeam),
    away: toCode(e.strAwayTeamShort || e.strAwayTeam),
    kickoff: `${e.dateEvent}T${e.strTime || "00:00:00"}Z`,
    status:
      e.strStatus === "Match Finished"
        ? "finished"
        : e.strStatus === "Not Started"
        ? "upcoming"
        : "live",
    score:
      e.intHomeScore != null && e.intHomeScore !== ""
        ? { home: Number(e.intHomeScore), away: Number(e.intAwayScore) }
        : null,
  }));
}

// ────────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────────
export async function loadTeams() {
  if (FD_ENABLED) {
    try {
      const t = await fdLoadTeams();
      if (t.length >= 8) return { teams: t, source: "football-data.org" };
    } catch (e) {
      console.warn("[wcApi] football-data teams failed:", e.message);
    }
  }
  try {
    const t = await sdbLoadTeams();
    if (t.length >= 8) return { teams: t, source: "thesportsdb.com" };
  } catch (e) {
    console.warn("[wcApi] thesportsdb teams failed:", e.message);
  }
  return { teams: Object.values(MOCK_TEAMS), source: "mock" };
}

export async function loadMatches() {
  if (FD_ENABLED) {
    try {
      const m = await fdLoadMatches();
      if (m.length) return { matches: m, source: "football-data.org" };
    } catch (e) {
      console.warn("[wcApi] football-data matches failed:", e.message);
    }
  }
  try {
    const m = await sdbLoadMatches();
    if (m.length) return { matches: m, source: "thesportsdb.com" };
  } catch (e) {
    console.warn("[wcApi] thesportsdb matches failed:", e.message);
  }
  return { matches: MOCK_MATCHES, source: "mock" };
}

export async function loadWorldCup() {
  const [t, m] = await Promise.all([loadTeams(), loadMatches()]);
  const teamMap = Object.fromEntries(
    t.teams.map((x) => [x.code, { ...x, flag: x.flag || flagFor(x.code) }])
  );
  return {
    teams: teamMap,
    matches: m.matches,
    source: { teams: t.source, matches: m.source },
  };
}
