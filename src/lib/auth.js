import { supabaseHub, isHubReady } from "./supabaseHub";

export const isSupabaseReady = isHubReady;

export async function getSession() {
  if (!isHubReady) return null;
  const { data } = await supabaseHub.auth.getSession();
  return data.session;
}

export async function signInWithGoogle() {
  if (!isHubReady) throw new Error("Supabase not configured");
  const { error } = await supabaseHub.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!isHubReady) return;
  await supabaseHub.auth.signOut();
}

export function onAuthChange(cb) {
  if (!isHubReady) return () => {};
  const { data } = supabaseHub.auth.onAuthStateChange((_event, session) => {
    cb(session);
  });
  return () => data.subscription.unsubscribe();
}

export function userDisplay(session) {
  const u = session?.user;
  if (!u) return null;
  const m = u.user_metadata || {};
  const fallbackName = u.email ? u.email.split("@")[0] : "User";
  return {
    id: u.id,
    email: u.email,
    name: m.full_name || m.name || fallbackName,
    avatar: m.avatar_url || m.picture || null,
  };
}
