import { supabase, isSupabaseReady } from "./supabase";

export async function fetchLeaderboard() {
  if (!isSupabaseReady) return [];
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .limit(100);
  if (error) {
    console.warn("[leaderboard] fetch failed:", error.message);
    return [];
  }
  return (data || []).map((row, i) => ({
    rank: i + 1,
    user_id: row.user_id,
    employee: row.full_name || row.email || "Anonymous",
    avatar: row.avatar_url,
    exact: row.exact_scores,
    correct: row.correct_results,
    points: row.total_points,
    locked: row.locked_count,
  }));
}

export async function fetchMyRow(userId) {
  if (!isSupabaseReady || !userId) return null;
  const all = await fetchLeaderboard();
  return all.find((r) => r.user_id === userId) || null;
}

export function subscribeLeaderboard(cb) {
  if (!isSupabaseReady || !supabase) return () => {};
  const channel = supabase
    .channel("leaderboard-stream")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "predictions" },
      () => cb()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "match_results" },
      () => cb()
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
