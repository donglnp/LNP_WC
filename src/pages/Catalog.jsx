import { Link } from "react-router-dom";
import GameCard from "../components/GameCard";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useAuth } from "../lib/AuthContext";
import { signOut } from "../lib/auth";
import { useT } from "../lib/i18n";

const GAMES = [
  {
    slug: "wc",
    name: "World Cup 2026",
    description:
      "Predict every FIFA World Cup 2026 match and climb the company leaderboard.",
    path: "/wc",
    icon: "⚽",
    accent: "green",
  },
  {
    slug: "wellness-challenge",
    name: "Wellness Challenge",
    description:
      "Chương trình rèn luyện sức khoẻ 3 tháng — ghi calo, đạt KPI tuần, săn giải thưởng.",
    path: "/wellness-challenge",
    icon: "💪",
    accent: "amber",
  },
];

export default function Catalog() {
  const { user, isAdmin } = useAuth();
  const { t } = useT();

  const initials = (user?.name || "?")
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  async function logout() {
    await signOut();
  }

  return (
    <div className="min-h-screen bg-arena-bg text-arena-text">
      <header className="border-b border-arena-border bg-arena-bg/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link to="/" className="shrink-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-arena-green shadow-[0_0_8px_#22E27A]" />
            <span className="font-display font-semibold tracking-tight text-lg">
              LNP Hub<span className="text-arena-green">.</span>
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center gap-2 rounded-md bg-arena-amber/15 hover:bg-arena-amber/25 text-arena-amber border border-arena-amber/30 px-3 py-1.5 text-xs font-semibold tracking-wide uppercase"
              >
                Admin
              </Link>
            )}
            <LanguageSwitcher variant="nav" />
            <button
              onClick={logout}
              className="text-[10px] tracking-[0.2em] uppercase px-3 py-2 rounded border border-arena-border hover:border-arena-red hover:text-arena-red"
            >
              {t("profile.sign_out")}
            </button>
            <div
              title={user?.name}
              className="w-9 h-9 rounded-full border border-arena-border bg-arena-card grid place-items-center text-xs font-semibold overflow-hidden"
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
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <section className="mb-10">
          <p className="text-[10px] tracking-[0.4em] uppercase text-arena-green">
            {t("common.system_online")}
          </p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl font-semibold">
            Welcome, <span className="text-arena-green">{user?.name?.split(" ")[0] || "Player"}</span>
          </h1>
          <p className="mt-3 text-sm text-arena-muted max-w-xl">
            Pick a game to jump into. Your sign-in works across every game in the Arena.
          </p>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {GAMES.map((g) => (
            <GameCard key={g.slug} game={g} />
          ))}
        </section>
      </main>
    </div>
  );
}
