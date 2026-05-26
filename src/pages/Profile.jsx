import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "../lib/auth";
import { fetchMyRow, subscribeLeaderboard } from "../lib/leaderboard";
import { useWorldCup } from "../lib/useWorldCup";
import { supabase, isSupabaseReady } from "../lib/supabase";
import { useT } from "../lib/i18n";

export default function Profile({ user }) {
  const { t } = useT();
  const nav = useNavigate();
  const [me, setMe] = useState(null);
  const [history, setHistory] = useState([]);
  const { data } = useWorldCup();

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    async function load() {
      const row = await fetchMyRow(user.id);
      if (!alive) return;
      setMe(row);
    }
    load();
    const off = subscribeLeaderboard(load);
    return () => {
      alive = false;
      off();
    };
  }, [user?.id]);

  useEffect(() => {
    if (!isSupabaseReady || !user?.id || !data) return;
    let alive = true;
    (async () => {
      const [predRes, resRes] = await Promise.all([
        supabase
          .from("predictions")
          .select("match_id, home_score, away_score, locked, updated_at")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })
          .limit(20),
        supabase
          .from("match_results")
          .select("match_id, home_score, away_score"),
      ]);
      if (!alive || predRes.error) return;
      const matchById = Object.fromEntries(data.matches.map((m) => [m.id, m]));
      const resultById = Object.fromEntries(
        (resRes.data || []).map((r) => [r.match_id, r])
      );
      setHistory(
        (predRes.data || []).map((p) => {
          const m = matchById[p.match_id];
          const r = resultById[p.match_id];
          return {
            id: p.match_id,
            label: m ? `${m.home} vs ${m.away}` : p.match_id,
            predicted: `${p.home_score} - ${p.away_score}`,
            result: r ? `${r.home_score} - ${r.away_score}` : null,
            exact:
              r &&
              r.home_score === p.home_score &&
              r.away_score === p.away_score,
            locked: p.locked,
            final: !!r,
            updated: p.updated_at,
          };
        })
      );
    })();
    return () => {
      alive = false;
    };
  }, [user?.id, data]);

  const total =
    (me?.exact ?? 0) + (me?.correct ?? 0) + (me?.locked ?? 0);
  const accuracy = total > 0 ? Math.round(((me?.exact ?? 0) / total) * 100) : 0;

  async function logout() {
    await signOut();
    nav("/login");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-arena-border bg-arena-surface p-4 sm:p-6 flex items-center gap-4 sm:gap-6 flex-wrap">
        <div className="w-20 h-20 rounded-full bg-arena-card border border-arena-border grid place-items-center text-2xl font-display font-semibold text-arena-muted overflow-hidden">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            (user?.name || "?")
              .split(" ")
              .map((s) => s[0])
              .join("")
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-2xl font-semibold">{user?.name}</h1>
          <p className="text-sm text-arena-muted">
            {t("profile.rank")}{" "}
            <span className="text-arena-green">
              {me ? `#${me.rank}` : "—"}
            </span>{" "}
            · {t("profile.total_points")}{" "}
            <span className="text-arena-text">{me?.points ?? 0}</span>
          </p>
          <p className="text-xs text-arena-muted mt-1">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="ml-auto text-xs tracking-[0.2em] uppercase px-3 py-2 rounded border border-arena-border hover:border-arena-red hover:text-arena-red"
        >
          {t("profile.sign_out")}
        </button>
      </section>

      <section className="rounded-lg border border-arena-border bg-arena-surface p-6">
        <h2 className="text-sm font-semibold mb-5">{t("profile.accuracy_breakdown")}</h2>
        <div className="grid md:grid-cols-[200px_1fr] gap-6 items-center">
          <Donut value={accuracy} label={t("profile.accuracy")} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Metric
              label={t("profile.exact_matches")}
              value={me?.exact ?? 0}
              color="green"
            />
            <Metric
              label={t("profile.correct_outcomes")}
              value={me?.correct ?? 0}
              color="amber"
            />
            <Metric
              label={t("profile.locked_predictions")}
              value={me?.locked ?? 0}
              color="muted"
            />
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-arena-border bg-arena-surface overflow-x-auto">
        <h2 className="px-4 sm:px-6 py-4 text-sm font-semibold border-b border-arena-border">
          {t("profile.history")}
        </h2>
        {history.length === 0 ? (
          <p className="px-6 py-8 text-sm text-arena-muted text-center">
            {t("profile.empty")}
          </p>
        ) : (
          <table className="w-full text-sm min-w-[340px]">
            <thead>
              <tr className="text-[10px] tracking-[0.25em] uppercase text-arena-muted border-b border-arena-border">
                <th className="px-3 sm:px-6 py-3 text-left font-medium">{t("profile.col_match")}</th>
                <th className="px-3 sm:px-6 py-3 text-left font-medium">
                  {t("profile.col_prediction")}
                </th>
                <th className="px-3 sm:px-6 py-3 text-left font-medium">{t("profile.col_result")}</th>
                <th className="px-3 sm:px-6 py-3 text-left font-medium">{t("profile.col_status")}</th>
                <th className="px-6 py-3 text-right font-medium">{t("profile.col_updated")}</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr
                  key={h.id}
                  className="border-b border-arena-border/60 last:border-0"
                >
                  <td className="px-3 sm:px-6 py-3">{h.label}</td>
                  <td className="px-3 sm:px-6 py-3 font-mono">{h.predicted}</td>
                  <td
                    className={`px-3 sm:px-6 py-3 font-mono ${
                      h.result
                        ? h.exact
                          ? "text-arena-green"
                          : "text-arena-text"
                        : "text-arena-muted"
                    }`}
                  >
                    {h.result || "—"}
                  </td>
                  <td className="px-3 sm:px-6 py-3">
                    <span
                      className={`text-[10px] tracking-[0.2em] uppercase px-2 py-1 rounded ${
                        h.final
                          ? "text-arena-text border border-arena-border bg-arena-border/30"
                          : h.locked
                          ? "text-arena-green border border-arena-green/30 bg-arena-green/10"
                          : "text-arena-muted border border-arena-border"
                      }`}
                    >
                      {h.final
                        ? t("status.final")
                        : h.locked
                        ? t("profile.status_locked")
                        : t("profile.status_editing")}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-3 text-right text-arena-muted text-xs">
                    {new Date(h.updated).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Donut({ value, label }) {
  const r = 42;
  const c = 2 * Math.PI * r;
  const dash = (value / 100) * c;
  return (
    <div className="relative w-40 h-40">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke="#1C242E"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke="#22E27A"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-display text-3xl font-semibold">{value}%</p>
          <p className="text-[10px] tracking-[0.3em] uppercase text-arena-muted">
            {label || "Accuracy"}
          </p>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color }) {
  const tone =
    color === "green"
      ? "text-arena-green"
      : color === "amber"
      ? "text-arena-amber"
      : "text-arena-muted";
  return (
    <div className="rounded border border-arena-border bg-arena-card p-4">
      <p className="text-[10px] tracking-[0.3em] uppercase text-arena-muted">
        {label}
      </p>
      <p className={`font-display text-3xl font-semibold mt-2 ${tone}`}>
        {value}
      </p>
    </div>
  );
}
