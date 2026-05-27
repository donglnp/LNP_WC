import { useEffect, useState } from "react";
import { fetchLeaderboard, subscribeLeaderboard } from "../lib/leaderboard";
import { useT } from "../../../lib/i18n";
import { LeaderboardSkeleton } from "../../../components/Skeleton";

export default function Leaderboard({ user }) {
  const { t } = useT();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    async function load() {
      const b = await fetchLeaderboard();
      if (!alive) return;
      setRows(b);
      setLoading(false);
    }
    load();
    const off = subscribeLeaderboard(load);
    return () => {
      alive = false;
      off();
    };
  }, []);

  if (loading) return <LeaderboardSkeleton />;

  const me = rows.find((r) => r.user_id === user?.id);

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">
            {t("lb.title")}
          </h1>
          <p className="text-sm text-arena-muted mt-1">
            {t("lb.subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <KPI label={t("lb.your_rank")} value={me ? `#${me.rank}` : "—"} />
          <KPI label={t("lb.your_points")} value={me?.points ?? 0} />
        </div>

      </div>

      <div className="rounded-lg border border-arena-border bg-arena-surface overflow-x-auto">
        <table className="w-full text-sm min-w-[340px]">
          <thead>
            <tr className="text-[10px] tracking-[0.25em] uppercase text-arena-muted border-b border-arena-border">
              <Th>{t("lb.col_rank")}</Th>
              <Th>{t("lb.col_employee")}</Th>
              <Th align="right">{t("lb.col_exact")}</Th>
              <Th align="right">{t("lb.col_correct")}</Th>
              <Th align="right">{t("lb.col_points")}</Th>
            </tr>
          </thead>
          <tbody>

            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-arena-muted">
                  {t("lb.empty")}
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr
                key={row.user_id}
                className={`border-b border-arena-border/60 last:border-0 ${
                  row.user_id === user?.id
                    ? "bg-arena-green/8 text-arena-green"
                    : "hover:bg-arena-card/60"
                }`}
              >
                <Td>
                  {row.rank <= 3 ? (
                    <span>
                      {row.rank === 1 ? "🏆" : row.rank === 2 ? "🥈" : "🥉"}
                    </span>
                  ) : (
                    <span className="text-arena-muted">{row.rank}</span>
                  )}
                </Td>
                <Td>
                  <span className="inline-flex items-center gap-2">
                    {row.avatar && (
                      <img
                        src={row.avatar}
                        alt=""
                        className="w-5 h-5 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    {row.employee}
                    {row.user_id === user?.id && (
                      <span className="text-[9px] tracking-[0.2em] uppercase px-1.5 py-0.5 rounded bg-arena-green/15 border border-arena-green/40">
                        {t("common.you")}
                      </span>
                    )}
                  </span>
                </Td>
                <Td align="right" mono>
                  {row.exact}
                </Td>
                <Td align="right" mono>
                  {row.correct}
                </Td>
                <Td align="right" mono className="font-semibold">
                  {row.points}
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ label, value }) {
  return (
    <div className="rounded-lg border border-arena-border bg-arena-surface px-4 sm:px-5 py-3 min-w-[120px] sm:min-w-[140px]">
      <p className="text-[10px] tracking-[0.3em] uppercase text-arena-muted">
        {label}
      </p>
      <p className="font-display text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}

function Th({ children, align = "left" }) {
  return (
    <th
      className={`px-3 sm:px-5 py-3 font-medium ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function Td({ children, align = "left", mono, className = "" }) {
  return (
    <td
      className={`px-3 sm:px-5 py-3 ${align === "right" ? "text-right" : "text-left"} ${
        mono ? "font-mono" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}
