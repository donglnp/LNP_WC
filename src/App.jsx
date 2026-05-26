import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Matches from "./pages/Matches";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import { getSession, onAuthChange, userDisplay } from "./lib/auth";
import { isSupabaseReady } from "./lib/supabase";
import { loadMyPredictions, reset as resetPredictions } from "./lib/predictions";
import { I18nProvider } from "./lib/i18n";

export default function App() {
  const [session, setSession] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(isSupabaseReady);

  useEffect(() => {
    let alive = true;
    getSession().then((s) => {
      if (!alive) return;
      setSession(s);
      setBootstrapping(false);
      if (s?.user?.id) loadMyPredictions(s.user.id);
    });
    const unsub = onAuthChange((s) => {
      if (!alive) return;
      setSession(s);
      if (s?.user?.id) loadMyPredictions(s.user.id);
      else resetPredictions();
    });
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  const user = userDisplay(session);

  if (bootstrapping) {
    return (
      <div className="min-h-screen grid place-items-center bg-arena-bg text-arena-muted text-sm">
        Loading session…
      </div>
    );
  }

  return (
    <I18nProvider>
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        {user ? (
          <Route element={<Layout user={user} />}>
            <Route index element={<Dashboard user={user} />} />
            <Route path="matches" element={<Matches user={user} />} />
            <Route path="leaderboard" element={<Leaderboard user={user} />} />
            <Route path="profile" element={<Profile user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" replace />} />
        )}
      </Routes>
    </BrowserRouter>
    </I18nProvider>
  );
}
