import { useEffect, useState } from "react";
import { ageFrom, groupByPosition, loadSquad } from "../lib/squads";
import FlagBadge from "./FlagBadge";
import { useT } from "../lib/i18n";
import { TeamSheetSkeleton } from "./Skeleton";

export default function TeamSheet({ team, onClose }) {
  const { t } = useT();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    loadSquad(team)
      .then((d) => alive && setData(d))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [team?.code, team?.apiId]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const groups = data ? groupByPosition(data.players) : [];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full grid place-items-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-3xl rounded-xl border border-arena-border bg-arena-surface shadow-card"
        >
          <header className="flex items-center gap-4 p-6 border-b border-arena-border">
            <FlagBadge team={team} size="lg" />
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl font-semibold">
                {team.name}
              </h2>
              <p className="text-xs text-arena-muted">
                {team.code}
                {data?.coach?.name &&
                  ` · ${t("team.coach")}: ${data.coach.name}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 grid place-items-center rounded-md border border-arena-border text-arena-muted hover:text-arena-text hover:border-arena-green/40"
              aria-label="Close"
            >
              ✕
            </button>
          </header>

          <div className="p-6">
            {loading && (
              <TeamSheetSkeleton />
            )}

            {!loading && groups.length === 0 && (
              <p className="text-sm text-arena-muted">{t("team.empty")}</p>
            )}

            {!loading && groups.length > 0 && (
              <div className="space-y-6">
                {groups.map(([position, players]) => (
                  <section key={position}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] tracking-[0.3em] uppercase text-arena-green">
                        {t(`team.pos_${position.toLowerCase()}`)}
                      </span>
                      <span className="text-xs text-arena-muted">
                        ({players.length})
                      </span>
                      <span className="ml-auto h-px flex-1 bg-arena-border" />
                    </div>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[10px] tracking-[0.25em] uppercase text-arena-muted">
                          <th className="text-left font-medium pb-2 w-12">#</th>
                          <th className="text-left font-medium pb-2">
                            {t("team.col_name")}
                          </th>
                          <th className="text-left font-medium pb-2">
                            {t("team.col_role")}
                          </th>
                          <th className="text-right font-medium pb-2 w-16">
                            {t("team.col_age")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {players.map((p, i) => (
                          <tr
                            key={`${p.name}-${i}`}
                            className="border-t border-arena-border/60"
                          >
                            <td className="py-2 font-mono text-arena-muted">
                              {p.number ?? "–"}
                            </td>
                            <td className="py-2">{p.name}</td>
                            <td className="py-2 text-arena-muted text-xs">
                              {p.rawPosition || p.position}
                            </td>
                            <td className="py-2 text-right font-mono text-arena-muted">
                              {ageFrom(p.birth) ?? "–"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                ))}
              </div>
            )}
          </div>

          {data && (
            <footer className="px-6 py-3 border-t border-arena-border text-[10px] tracking-[0.25em] uppercase text-arena-muted">
              {t("common.source")}: {data.source}
            </footer>
          )}
        </div>
      </div>
    </div>
  );
}
