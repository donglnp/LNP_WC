// Vercel Edge function — proxy for football-data.org.
//
// Browser → /api/fd/competitions/WC/teams
//        ↓ this function injects X-Auth-Token server-side
// football-data.org/v4/competitions/WC/teams

export const config = { runtime: "edge" };

const TARGET = "https://api.football-data.org/v4";

export default async function handler(req) {
  const url = new URL(req.url);
  const subpath = url.pathname.replace(/^\/api\/fd/, "");
  const upstream = `${TARGET}${subpath}${url.search}`;

  const token = process.env.FD_TOKEN;
  if (!token) {
    return json(
      {
        error: "FD_TOKEN not configured on the server",
        hint: "Set FD_TOKEN (no VITE_ prefix) in Vercel → Project → Settings → Environment Variables, then redeploy.",
        upstream,
      },
      500
    );
  }

  try {
    const res = await fetch(upstream, {
      headers: { "X-Auth-Token": token, accept: "application/json" },
    });
    const body = await res.text();
    return new Response(body, {
      status: res.status,
      headers: {
        "content-type":
          res.headers.get("content-type") || "application/json",
        "cache-control": "public, max-age=60, s-maxage=60",
        "x-fd-upstream-status": String(res.status),
      },
    });
  } catch (e) {
    return json({ error: "Upstream fetch failed", message: e.message, upstream }, 502);
  }
}

function json(payload, status) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: { "content-type": "application/json" },
  });
}
