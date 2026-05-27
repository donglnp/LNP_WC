import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

export default function AdminRoute() {
  const { user, isAdmin, ready } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center bg-arena-bg text-arena-muted text-sm">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-arena-bg text-center px-4">
        <div>
          <div className="text-5xl mb-3">🔒</div>
          <h1 className="font-display text-2xl font-semibold">
            Không có quyền truy cập
          </h1>
          <p className="mt-2 text-sm text-arena-muted">
            Trang Admin chỉ dành cho người được cấp quyền.
          </p>
          <a
            href="/"
            className="inline-block mt-5 text-xs tracking-[0.2em] uppercase text-arena-amber hover:underline"
          >
            ← Về trang chủ
          </a>
        </div>
      </div>
    );
  }
  return <Outlet />;
}
