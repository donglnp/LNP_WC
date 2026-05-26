// Vercel serverless function — proxy for football-data.org.
//
// vercel.json rewrites every /api/fd/* request to /api/fd?p=<subpath>.
// We forward to football-data.org with the X-Auth-Token header injected
// server-side (token stays out of the client bundle).
//
// Node runtime (default) — no special config needed and works on any plan.

const TARGET = "https://api.football-data.org/v4";

export default async function handler(req, res) {
  // Build the upstream URL. Prefer the ?p= rewrite param, but also support
  // a raw path (handy when testing the function directly).
  const url = new URL(req.url, "http://x");
  let subpath = url.searchParams.get("p") || "";
  if (!subpath) {
    subpath = url.pathname.replace(/^\/api\/fd\/?/, "");
  }
  if (subpath && !subpath.startsWith("/")) subpath = "/" + subpath;

  // Preserve any other query params the client sent.
  const passthroughQuery = new URLSearchParams();
  for (const [k, v] of url.searchParams) {
    if (k !== "p") passthroughQuery.append(k, v);
  }
  const qs = passthroughQuery.toString();
  const upstream = `${TARGET}${subpath}${qs ? `?${qs}` : ""}`;

  const token = process.env.FD_TOKEN;
  if (!token) {
    res.status(500).json({
      error: "FD_TOKEN not configured on the server",
      hint: "Set FD_TOKEN (no VITE_ prefix) in Vercel → Project → Settings → Environment Variables, then redeploy.",
      upstream,
    });
    return;
  }

  try {
    const upstreamRes = await fetch(upstream, {
      headers: { "X-Auth-Token": token, accept: "application/json" },
    });
    const body = await upstreamRes.text();
    res
      .status(upstreamRes.status)
      .setHeader(
        "content-type",
        upstreamRes.headers.get("content-type") || "application/json"
      )
      .setHeader("cache-control", "public, max-age=60, s-maxage=60")
      .setHeader("x-fd-upstream-status", String(upstreamRes.status))
      .send(body);
  } catch (e) {
    res
      .status(502)
      .json({ error: "Upstream fetch failed", message: e.message, upstream });
  }
}
