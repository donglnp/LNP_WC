import { useEffect, useState } from "react";
import FlagBadge from "../components/FlagBadge";
import { useWorldCup } from "../lib/useWorldCup";
import {
  getPrediction,
  loadMyPredictions,
  onPredictionsChange,
  savePrediction,
} from "../lib/predictions";
import { fetchLeaderboard, fetchMyRow, subscribeLeaderboard } from "../lib/leaderboard";
import { useT } from "../lib/i18n";
import { DashboardSkeleton } from "../components/Skeleton";

export default function Dashboard({ user }) {
  const { t } = useT();
  const { data, loading } = useWorldCup();
  const [, force] = useState(0);
  const [board, setBoard] = useState([]);
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (user?.id) loadMyPredictions(user.id).then(() => force((n) => n + 1));
    const off = onPredictionsChange(() => force((n) => n + 1));
    return off;
  }, [user?.id]);

  useEffect(() => {
    async function load() {
      const b = await fetchLeaderboard();
      setBoard(b);
      setMe(b.find((r) => r.user_id === user?.id) || null);
    }
    load();
    const off = subscribeLeaderboard(load);
    return off;
  }, [user?.id]);

  if (loading || !data) return <DashboardSkeleton />;

  const { teams, matches, source } = data;
  const sorted = [...matches].sort(
    (a, b) => new Date(a.kickoff) - new Date(b.kickoff)
  );
  const upcoming = sorted.filter((m) => m.status !== "finished");
  const upNext = upcoming[0] || sorted[0];
  const later = upcoming.slice(1, 4);

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-6">
      <section className="space-y-6">
        {upNext && (
          <Panel
            title={t("dash.up_next")}
            action={
              <span className="ml-auto text-[10px] tracking-[0.25em] uppercase text-arena-muted">
                {t("common.source")}: {source.matches}
              </span>
            }
          >
            <UpNext match={upNext} teams={teams} user={user} />
          </Panel>
        )}

        <Panel title={t("dash.later_today")}>
          {later.length === 0 ? (
            <p className="text-sm text-arena-muted">
              {t("dash.no_more")}
            </p>
          ) : (
            <ul className="divide-y divide-arena-border">
              {later.map((m) => (
                <LaterRow key={m.id} match={m} teams={teams} />
              ))}
            </ul>
          )}
        </Panel>
      </section>

      <aside className="space-y-6">
        <Panel title={t("dash.my_stats")}>
          <div className="grid grid-cols-2 gap-3">
            <Stat
              label={t("dash.current_rank")}
              value={me ? `#${me.rank}` : "—"}
            />
            <Stat label={t("dash.total_pts")} value={me?.points ?? 0} />
          </div>
          <div className="mt-4">
            <p className="text-[10px] tracking-[0.3em] uppercase text-arena-muted mb-2">
              {t("dash.locked")}
            </p>
            <p className="font-display text-3xl font-semibold">
              {me?.locked ?? 0}
            </p>
          </div>
        </Panel>

        <Panel title={t("dash.top5")}>
          {board.length === 0 ? (
            <p className="text-sm text-arena-muted">
              {t("dash.no_predictions")}
            </p>
          ) : (
            <ul className="space-y-3">
              {board.slice(0, 5).map((row) => (
                <li
                  key={row.user_id}
                  className={`flex items-center gap-3 text-sm ${
                    row.user_id === user?.id ? "text-arena-green" : ""
                  }`}
                >
                  <span className="w-5 text-xs text-arena-muted">
                    {row.rank}
                  </span>
                  <span className="flex-1 truncate">
                    {row.user_id === user?.id ? t("common.you") : row.employee}
                  </span>
                  <span className="font-mono text-xs">{row.points} {t("dash.pts")}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </aside>
    </div>
  );
}

function UpNext({ match, teams, user }) {
  const { t } = useT();
  const home = teams[match.home] || { code: match.home, flag: "🏳️" };
  const away = teams[match.away] || { code: match.away, flag: "🏳️" };
  const initial = getPrediction(match.id);
  const [h, setH] = useState(initial.home ?? 0);
  const [a, setA] = useState(initial.away ?? 0);
  const [locked, setLocked] = useState(!!initial.locked);
  const [saving, setSaving] = useState(false);
  const [countdown, setCountdown] = useState(formatCountdown(match.kickoff));

  useEffect(() => {
    setH(initial.home ?? 0);
    setA(initial.away ?? 0);
    setLocked(!!initial.locked);
  }, [match.id]); // eslint-disable-line

  useEffect(() => {
    const id = setInterval(
      () => setCountdown(formatCountdown(match.kickoff)),
      1000
    );
    return () => clearInterval(id);
  }, [match.kickoff]);

  async function toggleLock() {
    if (!user?.id || saving) return;
    setSaving(true);
    try {
      const nextLocked = !locked;
      await savePrediction(user.id, match.id, {
        home: h,
        away: a,
        locked: nextLocked,
      });
      setLocked(nextLocked);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 text-xs text-arena-green font-mono mb-5">
        <span>◆</span>
        <span>{t("dash.starts_in")} {countdown}</span>
        <span className="ml-auto h-px flex-1 bg-arena-border" />
        <span className="text-arena-muted">
          {t("dash.group")} {match.group} · ID: <span className="text-arena-green font-mono">{match.id}</span> · {new Date(match.kickoff).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-center">
        <TeamSide team={home} align="right" />
        <div className="flex items-center gap-3">
          <NumberBox value={h} onChange={setH} locked={locked} />
          <span className="text-arena-muted text-sm">vs</span>
          <NumberBox value={a} onChange={setA} locked={locked} />
        </div>
        <TeamSide team={away} align="left" />
      </div>

      <button
        onClick={toggleLock}
        disabled={saving}
        className={`mt-8 w-full rounded-md font-semibold tracking-[0.2em] uppercase text-sm py-3 transition disabled:opacity-50 ${
          locked
            ? "bg-arena-card border border-arena-border text-arena-muted hover:text-arena-text"
            : "bg-arena-green text-arena-bg hover:brightness-110"
        }`}
      >
        {saving ? t("common.saving") : locked ? t("dash.edit_prediction") : t("dash.lock_prediction")}
      </button>
    </>
  );
}

function formatCountdown(iso) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "00:00:00:00";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return [d, h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function Panel({ title, children, action }) {
  return (
    <section className="rounded-lg border border-arena-border bg-arena-surface">
      <header className="px-5 py-3 border-b border-arena-border flex items-center">
        <h2 className="text-sm font-semibold tracking-wide">{title}</h2>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function TeamSide({ team, align }) {
  return (
    <div
      className={`flex items-center gap-3 ${
        align === "right" ? "justify-end" : "justify-start"
      }`}
    >
      {align === "right" && (
        <p className="font-display font-semibold text-lg">{team.code}</p>
      )}
      <FlagBadge team={team} size="lg" />
      {align === "left" && (
        <p className="font-display font-semibold text-lg">{team.code}</p>
      )}
    </div>
  );
}

function NumberBox({ value, onChange, locked }) {
  return (
    <div
      className={`w-16 h-16 grid place-items-center rounded-md border ${
        locked
          ? "border-arena-border bg-arena-card text-arena-muted"
          : "border-arena-green/40 bg-arena-card"
      }`}
    >
      <input
        type="number"
        min={0}
        max={20}
        disabled={locked}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value || "0", 10))}
        className="w-full bg-transparent text-center text-2xl font-display font-semibold outline-none disabled:opacity-100"
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-[10px] tracking-[0.3em] uppercase text-arena-muted">
        {label}
      </p>
      <p className="font-display text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function LaterRow({ match, teams }) {
  const { t } = useT();
  const home = teams[match.home] || { code: match.home, flag: "🏳️" };
  const away = teams[match.away] || { code: match.away, flag: "🏳️" };
  const p = getPrediction(match.id);
  const locked = p.locked;
  return (
    <li className="py-3 flex items-center gap-4">
      <span className="font-mono text-xs text-arena-muted w-12">
        {new Date(match.kickoff).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
      <FlagBadge team={home} size="sm" />
      <span className="text-sm font-medium w-10">{home.code}</span>
      <span className="text-arena-muted text-xs">vs</span>
      <span className="text-sm font-medium w-10">{away.code}</span>
      <FlagBadge team={away} size="sm" />
      <span className="ml-auto flex items-center gap-2">
        {p.home != null && (
          <span className="font-mono text-sm text-arena-muted">
            {p.home} - {p.away ?? "?"}
          </span>
        )}
        <span
          className={`text-[10px] tracking-[0.2em] uppercase px-2 py-1 rounded ${
            locked
              ? "bg-arena-green/10 text-arena-green border border-arena-green/30"
              : "bg-arena-border/40 text-arena-muted border border-arena-border"
          }`}
        >
          {locked ? t("dash.locked_badge") : t("dash.pending")}
        </span>
      </span>
    </li>
  );
}

