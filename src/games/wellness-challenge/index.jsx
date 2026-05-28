import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import Leaderboard from "./pages/Leaderboard";
import Log from "./pages/Log";
import Rules from "./pages/Rules";
import { useAuth } from "../../lib/AuthContext";

export default function WellnessChallenge() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route element={<Layout user={user} />}>
        <Route index element={<Dashboard />} />
        <Route path="log" element={<Log />} />
        <Route path="history" element={<History />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="rules" element={<Rules />} />
        <Route path="*" element={<Navigate to="" replace />} />
      </Route>
    </Routes>
  );
}
