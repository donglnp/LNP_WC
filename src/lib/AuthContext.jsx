import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getSession, onAuthChange, userDisplay, isSupabaseReady } from "./auth";
import { supabaseHub } from "./supabaseHub";

const AuthContext = createContext({
  session: null,
  user: null,
  profile: null,
  isAdmin: false,
  ready: false,
  refreshProfile: () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [sessionReady, setSessionReady] = useState(!isSupabaseReady);
  const [profileReady, setProfileReady] = useState(true);

  useEffect(() => {
    let alive = true;
    getSession().then((s) => {
      if (!alive) return;
      setSession(s);
      setSessionReady(true);
    });
    const unsub = onAuthChange((s) => {
      if (!alive) return;
      setSession(s);
    });
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  const userId = session?.user?.id;

  const fetchProfile = useCallback(async () => {
    if (!supabaseHub || !userId) {
      setProfile(null);
      setProfileReady(true);
      return;
    }
    setProfileReady(false);
    const { data, error } = await supabaseHub
      .from("profiles")
      .select("id, full_name, email, avatar_url, gender, is_admin, joined_wellness")
      .eq("id", userId)
      .maybeSingle();
    if (error) {
      console.warn("[AuthContext] failed to load profile", error);
      setProfile(null);
    } else {
      setProfile(data);
    }
    setProfileReady(true);
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const value = {
    session,
    user: userDisplay(session),
    profile,
    isAdmin: Boolean(profile?.is_admin),
    ready: sessionReady && profileReady,
    refreshProfile: fetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
