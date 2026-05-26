import { supabase, isSupabaseReady } from "./supabase";

export async function getSession() {
  if (!isSupabaseReady) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function sendMagicLink(email) {
  if (!isSupabaseReady) throw new Error("Supabase not configured");
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // Where Supabase should redirect the browser after the user clicks
      // the email link. Must be in the project's Redirect URLs allow-list.
      emailRedirectTo: `${window.location.origin}/`,
      shouldCreateUser: true,
    },
  });
  if (error) throw error;
}

export async function signOut() {
  if (!isSupabaseReady) return;
  await supabase.auth.signOut();
}

export function onAuthChange(cb) {
  if (!isSupabaseReady) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
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
