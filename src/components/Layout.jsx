import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import LanguageSwitcher from "./LanguageSwitcher";
import RulesModal from "./RulesModal";
import { useT } from "../lib/i18n";

export default function Layout({ user }) {
  const { t } = useT();
  const [rulesOpen, setRulesOpen] = useState(false);
  const initials = (user?.name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const TABS = [
    { to: "/", label: t("nav.dashboard"), end: true },
    { to: "/matches", label: t("nav.matches") },
    { to: "/leaderboard", label: t("nav.leaderboard") },
  ];

  return (
    <div className="min-h-screen bg-arena-bg text-arena-text">
      <header className="border-b border-arena-border bg-arena-bg/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-8">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-arena-green shadow-[0_0_8px_#22E27A]" />
            <span className="font-display font-semibold tracking-tight text-lg">
              LNP Arena<span className="text-arena-green">.</span>
            </span>
          </NavLink>

          <nav className="flex items-center gap-1 ml-4">
            {TABS.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm rounded-md transition ${
                    isActive
                      ? "text-arena-green"
                      : "text-arena-muted hover:text-arena-text"
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              title={t("rules.cta")}
              className="text-xs text-arena-muted hover:text-arena-text inline-flex items-center gap-1.5"
            >
              <span className="w-5 h-5 grid place-items-center rounded-full border border-arena-border text-[11px] font-semibold">
                ?
              </span>
              <span className="hidden sm:inline">{t("rules.cta")}</span>
            </button>
            <LanguageSwitcher variant="nav" />
            <NavLink
              to="/profile"
              title={user?.name}
              className="w-9 h-9 rounded-full border border-arena-border bg-arena-card grid place-items-center text-xs font-semibold hover:border-arena-green/60 overflow-hidden"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt=""
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                initials
              )}
            </NavLink>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <Outlet />
      </main>

      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
    </div>
  );
}
