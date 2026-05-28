import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../lib/AuthContext";
import { useT, localeOf, formatNum } from "../../../lib/i18n";
import { fetchMyEntries, subscribeEntries } from "../lib/wellness";
import {
  PROGRAM,
  findDevice,
  findExercise,
} from "../lib/data";

export default function History() {
  const { user } = useAuth();
  const { t, lang } = useT();
  const locale = localeOf(lang);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("all");

  const MONTHS = [
    { value: "all", label: t("wc.history_filter_all") },
    { value: "6", label: t("wc.month_6") },
    { value: "7", label: t("wc.month_7") },
    { value: "8", label: t("wc.month_8") },
  ];

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    async function load() {
      setLoading(true);
      const data = await fetchMyEntries(user.id);
      if (!alive) return;
      setEntries(data);
      setLoading(false);
    }
    load();
    const off = subscribeEntries(load);
    return () => {
      alive = false;
      off();
    };
  }, [user?.id]);

  const filtered = useMemo(() => {
    if (month === "all") return entries;
    return entries.filter(
      (e) => String(new Date(e.entry_date).getMonth() + 1) === month
    );
  }, [entries, month]);

  const total = filtered.reduce((s, e) => s + (e.kcal || 0), 0);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.4em] uppercase text-arena-amber">
            {t("wc.history_header_meta", {
              count: filtered.length,
              kcal: formatNum(total, lang),
            })}
          </p>
          <h1 className="font-display text-3xl font-semibold mt-2">
            {t("wc.history_title")}
          </h1>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {MONTHS.map((m) => (
          <button
            key={m.value}
            onClick={() => setMonth(m.value)}
            className={`px-3 py-1.5 text-xs rounded-md border transition ${
              month === m.value
                ? "border-arena-amber text-arena-amber bg-arena-amber/10"
                : "border-arena-border text-arena-muted hover:text-arena-text"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <section className="rounded-lg border border-arena-border bg-arena-surface overflow-x-auto">
        {loading ? (
          <p className="py-12 text-sm text-arena-muted text-center">
            {t("wc.loading")}
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-sm text-arena-muted text-center">
            {t("wc.history_empty")}
          </p>
        ) : (
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-[10px] tracking-[0.25em] uppercase text-arena-muted border-b border-arena-border">
                <th className="px-4 py-3 text-left font-medium">{t("wc.history_col_date")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("wc.history_col_type")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("wc.history_col_duration")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("wc.history_col_kcal")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("wc.history_col_device")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("wc.history_col_photos")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("wc.history_col_status")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const ex = findExercise(e.exercise_type);
                const dev = findDevice(e.device);
                const dateStr = new Date(e.entry_date).toLocaleDateString(
                  locale,
                  { day: "2-digit", month: "2-digit", year: "numeric" }
                );
                return (
                  <tr
                    key={e.id}
                    className="border-b border-arena-border/60 last:border-0 hover:bg-arena-card/50"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-arena-muted">
                      {dateStr}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-lg">{ex.icon}</span>
                        {e.exercise_type === "other" && e.exercise_other
                          ? e.exercise_other
                          : t(`wc.ex_${ex.id}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {e.duration_min}{" "}
                      <span className="text-arena-muted">
                        {t("wc.minutes_short")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-arena-amber font-semibold">
                      {formatNum(e.kcal, lang)}
                    </td>
                    <td className="px-4 py-3 text-arena-muted text-xs">
                      {e.device === "other" && e.device_other
                        ? e.device_other
                        : dev
                        ? t(`wc.dev_${dev.id}`)
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <PhotoChip url={e.photo_before_url} />
                        <PhotoChip url={e.photo_after_url} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.status} t={t} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-[11px] text-arena-muted">
        {t("wc.history_program_range", {
          start: PROGRAM.startDate.toLocaleDateString(locale),
          end: PROGRAM.endDate.toLocaleDateString(locale),
        })}
      </p>

    </div>
  );
}

function PhotoChip({ url }) {
  if (!url) return <span className="text-arena-muted">—</span>;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      title={url}
      className="inline-flex items-center justify-center w-8 h-8 rounded border border-arena-border hover:border-arena-amber hover:text-arena-amber text-arena-muted text-sm transition"
    >
      🔗
    </a>
  );
}

function StatusBadge({ status, t }) {
  const map = {
    approved: {
      label: t("wc.status_approved"),
      cls: "text-arena-green border-arena-green/30 bg-arena-green/10",
    },
    pending: {
      label: t("wc.status_pending"),
      cls: "text-arena-amber border-arena-amber/30 bg-arena-amber/10",
    },
    rejected: {
      label: t("wc.status_rejected"),
      cls: "text-arena-red border-arena-red/30 bg-arena-red/10",
    },
  };
  const m = map[status] || map.pending;
  return (
    <span
      className={`text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded border ${m.cls}`}
    >
      {m.label}
    </span>
  );
}
