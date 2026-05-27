// Lightweight mock dataset for UI development. Replace with real API + Supabase later.

export const TEAMS = {
  ARG: { code: "ARG", name: "Argentina", flag: "🇦🇷" },
  FRA: { code: "FRA", name: "France", flag: "🇫🇷" },
  BRA: { code: "BRA", name: "Brazil", flag: "🇧🇷" },
  SRB: { code: "SRB", name: "Serbia", flag: "🇷🇸" },
  POR: { code: "POR", name: "Portugal", flag: "🇵🇹" },
  GHA: { code: "GHA", name: "Ghana", flag: "🇬🇭" },
  MEX: { code: "MEX", name: "Mexico", flag: "🇲🇽" },
  AUS: { code: "AUS", name: "Australia", flag: "🇦🇺" },
  ESP: { code: "ESP", name: "Spain", flag: "🇪🇸" },
  GER: { code: "GER", name: "Germany", flag: "🇩🇪" },
  ENG: { code: "ENG", name: "England", flag: "🏴" },
  USA: { code: "USA", name: "USA", flag: "🇺🇸" },
  JPN: { code: "JPN", name: "Japan", flag: "🇯🇵" },
  KOR: { code: "KOR", name: "S. Korea", flag: "🇰🇷" },
  NED: { code: "NED", name: "Netherlands", flag: "🇳🇱" },
  CRO: { code: "CRO", name: "Croatia", flag: "🇭🇷" },
};

export const MATCHES = [
  {
    id: "m1",
    group: "A",
    home: "ARG",
    away: "FRA",
    kickoff: "2026-06-12T19:00:00Z",
    status: "upcoming",
    countdownLabel: "00:12:45:30",
    prediction: { home: 2, away: 1, locked: false, status: "pending" },
  },
  {
    id: "m2",
    group: "A",
    home: "BRA",
    away: "SRB",
    kickoff: "2026-06-12T22:00:00Z",
    status: "upcoming",
    prediction: { home: null, away: null, locked: true, status: "locked" },
  },
  {
    id: "m3",
    group: "A",
    home: "POR",
    away: "GHA",
    kickoff: "2026-06-12T16:00:00Z",
    status: "upcoming",
    prediction: { home: 3, away: 0, locked: true, status: "locked" },
  },
  {
    id: "m4",
    group: "B",
    home: "FRA",
    away: "AUS",
    kickoff: "2026-06-13T19:00:00Z",
    status: "upcoming",
    prediction: { home: 2, away: 0, locked: true, status: "locked" },
  },
  {
    id: "m5",
    group: "C",
    home: "BRA",
    away: "SRB",
    kickoff: "2026-06-14T15:30:00Z",
    status: "upcoming",
    prediction: { home: 3, away: null, locked: false, status: "editing" },
  },
  {
    id: "m6",
    group: "B",
    home: "ESP",
    away: "GER",
    kickoff: "2026-06-13T21:00:00Z",
    status: "upcoming",
    prediction: { home: null, away: null, locked: false, status: "pending" },
  },
  {
    id: "m7",
    group: "C",
    home: "ENG",
    away: "USA",
    kickoff: "2026-06-14T18:00:00Z",
    status: "upcoming",
    prediction: { home: null, away: null, locked: false, status: "pending" },
  },
  {
    id: "m8",
    group: "C",
    home: "JPN",
    away: "KOR",
    kickoff: "2026-06-14T20:30:00Z",
    status: "upcoming",
    prediction: { home: 1, away: 1, locked: true, status: "locked" },
  },
];

export const LEADERBOARD = [
  { rank: 1, employee: "Alex Johnson", exact: 5, correct: 12, points: 150 },
  { rank: 2, employee: "Maria Garcia", exact: 4, correct: 11, points: 135 },
  { rank: 3, employee: "James Smith", exact: 4, correct: 11, points: 130 },
  { rank: 4, employee: "Current User", exact: 3, correct: 9, points: 110, you: true },
  { rank: 5, employee: "Linda Davis", exact: 2, correct: 8, points: 95 },
  { rank: 6, employee: "David Chen", exact: 2, correct: 7, points: 88 },
  { rank: 7, employee: "Priya Patel", exact: 1, correct: 7, points: 80 },
  { rank: 8, employee: "Noah Kim", exact: 1, correct: 6, points: 72 },
];

export const CURRENT_USER = {
  name: "Jane Doe",
  rank: 4,
  totalPoints: 120,
  accuracy: 68,
  exactMatches: 12,
  correctOutcomes: 24,
  missed: 9,
};

export const HISTORY = [
  { match: "ARG vs FRA", actual: "ARG 2 - 1 FRA", predicted: "ARG 2 - 1 FRA", points: 15, hit: true },
  { match: "ENG vs USA", actual: "ENG 0 - 2 USA", predicted: "ENG 3 - 0 USA", points: 0 },
  { match: "BRA vs CRO", actual: "BRA 1 - 1 CRO", predicted: "BRA 1 - 1 CRO", points: 15, hit: true },
  { match: "ESP vs GER", actual: "ESP 2 - 1 GER", predicted: "ESP 2 - 0 GER", points: 5 },
];

export function matchLabel(m) {
  return `${TEAMS[m.home].code} vs ${TEAMS[m.away].code}`;
}

export function kickoffHHMM(m) {
  const d = new Date(m.kickoff);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
