// Squad / player loader. Returns:
//   { coach: {name,nationality}|null, players: [{name,position,number,nationality,birth}] }
//
// Sources (in order):
//   1. football-data.org /teams/{id}  (needs proxy + token; same as wcApi)
//   2. TheSportsDB lookup_all_players.php?id={idTeam}
//   3. Mock placeholder
//
// Cached per team-key in module memory.

const FD_PROXY = import.meta.env.VITE_FD_PROXY || "/api/fd";
const FD_ENABLED = import.meta.env.DEV
  ? Boolean(import.meta.env.VITE_FD_TOKEN)
  : Boolean(import.meta.env.VITE_FD_PROXY);
const SPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/3";

const cache = new Map();

const POSITION_ORDER = [
  "Goalkeeper",
  "Defence",
  "Midfield",
  "Offence",
];

function normalizeFdPosition(pos) {
  if (!pos) return "Other";
  const p = pos.toLowerCase();
  if (p.includes("goal")) return "Goalkeeper";
  if (p.includes("back") || p.includes("defen")) return "Defence";
  if (p.includes("mid")) return "Midfield";
  if (
    p.includes("forw") ||
    p.includes("striker") ||
    p.includes("wing") ||
    p.includes("attack") ||
    p.includes("offence")
  )
    return "Offence";
  return "Other";
}

function normalizeSdbPosition(pos) {
  return normalizeFdPosition(pos);
}

async function loadFd(apiId) {
  const res = await fetch(`${FD_PROXY}/teams/${apiId}`);
  if (!res.ok) throw new Error("fd team " + res.status);
  const json = await res.json();
  const players = (json.squad || []).map((p) => ({
    name: p.name,
    position: normalizeFdPosition(p.position),
    rawPosition: p.position,
    number: p.shirtNumber || null,
    nationality: p.nationality,
    birth: p.dateOfBirth,
  }));
  return {
    coach: json.coach
      ? { name: json.coach.name, nationality: json.coach.nationality }
      : null,
    players,
    source: "football-data.org",
  };
}

async function loadSdb(apiId) {
  const res = await fetch(`${SPORTSDB_BASE}/lookup_all_players.php?id=${apiId}`);
  if (!res.ok) throw new Error("sdb players " + res.status);
  const json = await res.json();
  const players = (json.player || []).map((p) => ({
    name: p.strPlayer,
    position: normalizeSdbPosition(p.strPosition),
    rawPosition: p.strPosition,
    number: p.strNumber || null,
    nationality: p.strNationality,
    birth: p.dateBorn,
  }));
  return { coach: null, players, source: "thesportsdb.com" };
}

function mockSquad(team) {
  const sample = [
    { name: "Player 1", position: "Goalkeeper", number: 1 },
    { name: "Player 2", position: "Defence", number: 4 },
    { name: "Player 3", position: "Defence", number: 5 },
    { name: "Player 4", position: "Midfield", number: 8 },
    { name: "Player 5", position: "Midfield", number: 10 },
    { name: "Player 6", position: "Offence", number: 9 },
  ];
  return {
    coach: null,
    players: sample.map((p) => ({
      ...p,
      nationality: team.name,
      birth: null,
      rawPosition: p.position,
    })),
    source: "mock",
  };
}

export async function loadSquad(team) {
  if (!team) return { coach: null, players: [], source: "mock" };
  const key = `${team.apiSource || "?"}:${team.apiId || team.code}`;
  if (cache.has(key)) return cache.get(key);

  let result = null;
  if (team.apiSource === "fd" && team.apiId && FD_ENABLED) {
    try {
      result = await loadFd(team.apiId);
    } catch (e) {
      console.warn("[squads] fd failed:", e.message);
    }
  }
  if (!result && team.apiSource === "sdb" && team.apiId) {
    try {
      result = await loadSdb(team.apiId);
    } catch (e) {
      console.warn("[squads] sdb failed:", e.message);
    }
  }
  if (!result) result = mockSquad(team);
  cache.set(key, result);
  return result;
}

export function groupByPosition(players) {
  const buckets = new Map(POSITION_ORDER.map((p) => [p, []]));
  buckets.set("Other", []);
  players.forEach((p) => {
    const k = buckets.has(p.position) ? p.position : "Other";
    buckets.get(k).push(p);
  });
  return [...buckets.entries()].filter(([_, arr]) => arr.length > 0);
}

export function ageFrom(birth) {
  if (!birth) return null;
  const d = new Date(birth);
  if (isNaN(d.getTime())) return null;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}
