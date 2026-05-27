import { supabaseHub } from "../../../lib/supabaseHub";

const ENTRY_COLS =
  "id, user_id, entry_date, exercise_type, duration_min, kcal, device, photo_before_url, photo_after_url, status, notes, created_at, updated_at";

export async function fetchMyEntries(userId) {
  if (!supabaseHub || !userId) return [];
  const { data, error } = await supabaseHub
    .from("wellness_entries")
    .select(ENTRY_COLS)
    .eq("user_id", userId)
    .order("entry_date", { ascending: false });
  if (error) {
    console.warn("[wellness] fetchMyEntries", error);
    return [];
  }
  return data || [];
}

export async function fetchAllEntries() {
  if (!supabaseHub) return [];
  const { data, error } = await supabaseHub
    .from("wellness_entries")
    .select(ENTRY_COLS)
    .order("entry_date", { ascending: false });
  if (error) {
    console.warn("[wellness] fetchAllEntries", error);
    return [];
  }
  return data || [];
}

export async function fetchWellnessProfiles() {
  if (!supabaseHub) return [];
  const { data, error } = await supabaseHub
    .from("profiles")
    .select("id, full_name, email, avatar_url, gender, is_admin, joined_wellness")
    .order("full_name", { ascending: true });
  if (error) {
    console.warn("[wellness] fetchWellnessProfiles", error);
    return [];
  }
  return data || [];
}

export async function upsertEntry(payload) {
  if (!supabaseHub) throw new Error("Supabase not configured");
  const row = {
    user_id: payload.user_id,
    entry_date: payload.entry_date,
    exercise_type: payload.exercise_type,
    duration_min: Number(payload.duration_min),
    kcal: Number(payload.kcal),
    device: payload.device || null,
    photo_before_url: payload.photo_before_url,
    photo_after_url: payload.photo_after_url,
    status: payload.status || "approved",
    notes: payload.notes || null,
  };
  const op = payload.id
    ? supabaseHub
        .from("wellness_entries")
        .update(row)
        .eq("id", payload.id)
        .select(ENTRY_COLS)
        .single()
    : supabaseHub
        .from("wellness_entries")
        .insert(row)
        .select(ENTRY_COLS)
        .single();
  const { data, error } = await op;
  if (error) throw error;
  return data;
}

export async function deleteEntry(id) {
  if (!supabaseHub) throw new Error("Supabase not configured");
  const { error } = await supabaseHub.from("wellness_entries").delete().eq("id", id);
  if (error) throw error;
}

export async function updateProfileMeta(id, patch) {
  if (!supabaseHub) throw new Error("Supabase not configured");
  const { data, error } = await supabaseHub
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .select("id, full_name, email, avatar_url, gender, is_admin, joined_wellness")
    .single();
  if (error) throw error;
  return data;
}

// Realtime helper — re-runs cb on any entries change.
export function subscribeEntries(cb) {
  if (!supabaseHub) return () => {};
  const ch = supabaseHub
    .channel("wellness_entries_changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "wellness_entries" },
      () => cb()
    )
    .subscribe();
  return () => supabaseHub.removeChannel(ch);
}
