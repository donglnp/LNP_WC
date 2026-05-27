import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function ProtectedRoute() {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-arena-bg text-arena-muted text-sm">
        Loading session…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
