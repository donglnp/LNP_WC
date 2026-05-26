// Vercel serverless function — production proxy for football-data.org.
//
// Browser  →  /api/fd/competitions/WC/teams
//          ↓ this function injects X-Auth-Token server-side
//          ↓
//      https://api.football-data.org/v4/competitions/WC/teams
//
// Token is read from the FD_TOKEN env var (set in Vercel project settings),
// so it never reaches the client bundle. Mirrors the Vite dev proxy in
// vite.config.js so the client code can call /api/fd/* identically in both
// environments.

export const config = { runtime: "edge" };

const TARGET = "https://api.football-data.org/v4";

export default async function handler(req) {
  const url = new URL(req.url);
  // /api/fd/foo/bar?x=1  →  /foo/bar?x=1
  const subpath = url.pathname.replace(/^\/api\/fd/, "");
  const upstream = `${TARGET}${subpath}${url.search}`;

  const token = process.env.FD_TOKEN;
  if (!token) {
    return new Response(
      JSON.stringify({ error: "FD_TOKEN not configured on the server" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const res = await fetch(upstream, {
    headers: {
      "X-Auth-Token": token,
      accept: "application/json",
    },
  });

  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: {
      "content-type": res.headers.get("content-type") || "application/json",
      // Cache competition data briefly at the edge to stay within free tier
      // (10 req/min on football-data). Adjust to taste.
      "cache-control": "public, max-age=60, s-maxage=60",
    },
  });
}
