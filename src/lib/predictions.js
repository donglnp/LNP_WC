import { supabase, isSupabaseReady } from "./supabase";

// In-memory cache: map<matchId, prediction>
let cache = new Map();
let loaded = false;
let listeners = new Set();
let realtimeChannel = null;

function emit() {
  listeners.forEach((l) => l());
}

export function onPredictionsChange(cb) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getPrediction(matchId) {
  return (
    cache.get(matchId) || { home: null, away: null, locked: false, status: "pending" }
  );
}

export function statusOf(p) {
  if (!p) return "pending";
  if (p.locked) return "locked";
  if (p.home != null || p.away != null) return "editing";
  return "pending";
}

export async function loadMyPredictions(userId) {
  if (loaded && cache.size) return cache;

  if (!isSupabaseReady || !userId) {
    // localStorage fallback
    try {
      const map = JSON.parse(localStorage.getItem("arena-predictions") || "{}");
      cache = new Map(
        Object.entries(map).map(([id, p]) => [
          id,
          { home: p.home, away: p.away, locked: !!p.locked },
        ])
      );
    } catch {
      cache = new Map();
    }
    loaded = true;
    return cache;
  }

  const { data, error } = await supabase
    .from("predictions")
    .select("match_id, home_score, away_score, locked")
    .eq("user_id", userId);
  if (error) {
    console.warn("[predictions] load failed:", error.message);
    cache = new Map();
  } else {
    cache = new Map(
      (data || []).map((r) => [
        r.match_id,
        { home: r.home_score, away: r.away_score, locked: r.locked },
      ])
    );
  }
  loaded = true;

  // Subscribe to realtime updates for *this* user
  if (realtimeChannel) supabase.removeChannel(realtimeChannel);
  realtimeChannel = supabase
    .channel(`my-predictions-${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "predictions",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        const row = payload.new || payload.old;
        if (!row) return;
        if (payload.eventType === "DELETE") {
          cache.delete(row.match_id);
        } else {
          cache.set(row.match_id, {
            home: row.home_score,
            away: row.away_score,
            locked: row.locked,
          });
        }
        emit();
      }
    )
    .subscribe();

  emit();
  return cache;
}

export async function savePrediction(userId, matchId, patch) {
  const prev = getPrediction(matchId);
  const next = { ...prev, ...patch };
  cache.set(matchId, next);
  emit();

  if (!isSupabaseReady || !userId) {
    const all = Object.fromEntries(cache.entries());
    localStorage.setItem("arena-predictions", JSON.stringify(all));
    return next;
  }

  const { error } = await supabase.from("predictions").upsert(
    {
      user_id: userId,
      match_id: matchId,
      home_score: next.home ?? 0,
      away_score: next.away ?? 0,
      locked: !!next.locked,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,match_id" }
  );

  if (error) {
    console.error("[predictions] save failed:", error.message);
    throw error;
  }
  return next;
}

export function reset() {
  cache = new Map();
  loaded = false;
  if (realtimeChannel && supabase) {
    supabase.removeChannel(realtimeChannel);
    realtimeChannel = null;
  }
  emit();
}
