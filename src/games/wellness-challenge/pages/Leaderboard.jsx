import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../lib/AuthContext";
import { useT, formatNum } from "../../../lib/i18n";
import {
  fetchAllEntries,
  fetchWellnessProfiles,
  subscribeEntries,
} from "../lib/wellness";
import {
  currentMonthInfo,
  monthlyKpi,
  sumKcalInMonth,
  sumKcalTotal,
  weeksMetKpi,
} from "../lib/data";

export default function Leaderboard() {
  const { user } = useAuth();
  const { t, lang } = useT();
  const [profiles, setProfiles] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState("all");
  const monthInfo = currentMonthInfo();
  const [month, setMonth] = useState(
    [6, 7, 8].includes(monthInfo.month) ? String(monthInfo.month) : "all"
  );

  const GENDER_TABS = [
    { value: "all", label: t("wc.lb_gender_all") },
    { value: "male", label: t("wc.gender_male") },
    { value: "female", label: t("wc.gender_female") },
  ];

  const MONTH_TABS = [
    { value: "all", label: t("wc.history_filter_all") },
    { value: "6", label: t("wc.month_6") },
    { value: "7", label: t("wc.month_7") },
    { value: "8", label: t("wc.month_8") },
  ];

  useEffect(() => {
    let alive = true;
    async function load() {
      setLoading(true);
      const [profs, ents] = await Promise.all([
        fetchWellnessProfiles(),
        fetchAllEntries(),
      ]);
      if (!alive) return;
      setProfiles(profs);
      setEntries(ents);
      setLoading(false);
    }
    load();
    const off = subscribeEntries(load);
    return () => {
      alive = false;
      off();
    };
  }, []);

  const rows = useMemo(() => {
    const participants = profiles.filter(
      (p) => p.joined_wellness && p.gender && (gender === "all" || p.gender === gender)
    );
    const byUser = new Map();
    for (const e of entries) {
      const list = byUser.get(e.user_id) || [];
      list.push(e);
      byUser.set(e.user_id, list);
    }
    return participants
      .map((p) => {
        const own = byUser.get(p.id) || [];
        const kcal =
          month === "all"
            ? sumKcalTotal(own)
            : sumKcalInMonth(own, Number(month));
        return {
          id: p.id,
          name: p.full_name || p.email,
          gender: p.gender,
          avatar: p.avatar_url,
          kcal,
          weeks_hit: weeksMetKpi(own, p.gender),
        };
      })
      .sort((a, b) => b.kcal - a.kcal)
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [profiles, entries, gender, month]);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[10px] tracking-[0.4em] uppercase text-arena-amber">
          {t("wc.lb_header_meta", {
            month:
              month === "all"
                ? t("wc.history_filter_all")
                : t(`wc.month_${month}`),
          })}
        </p>
        <h1 className="font-display text-3xl font-semibold mt-2">
          {t("wc.lb_title")}
        </h1>
      </header>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-1 p-1 rounded-md border border-arena-border bg-arena-card">
          {GENDER_TABS.map((g) => (
            <button
              key={g.value}
              onClick={() => setGender(g.value)}
              className={`px-3 py-1.5 text-xs rounded transition ${
                gender === g.value
                  ? "bg-arena-amber text-arena-bg"
                  : "text-arena-muted hover:text-arena-text"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 p-1 rounded-md border border-arena-border bg-arena-card">
          {MONTH_TABS.map((m) => (
            <button
              key={m.value}
              onClick={() => setMonth(m.value)}
              className={`px-3 py-1.5 text-xs rounded transition ${
                month === m.value
                  ? "bg-arena-amber text-arena-bg"
                  : "text-arena-muted hover:text-arena-text"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-lg border border-arena-border bg-arena-surface overflow-x-auto">
        {loading ? (
          <p className="py-12 text-sm text-arena-muted text-center">{t("wc.loading")}</p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-sm text-arena-muted text-center">
            {t("wc.lb_empty")}
          </p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-[10px] tracking-[0.25em] uppercase text-arena-muted border-b border-arena-border">
                <th className="px-4 py-3 text-left font-medium w-16">#</th>
                <th className="px-4 py-3 text-left font-medium">{t("wc.lb_col_name")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("wc.lb_col_gender")}</th>
                <th className="px-4 py-3 text-right font-medium">
                  {month === "all"
                    ? t("wc.lb_col_kcal_total")
                    : t("wc.lb_col_kcal_month")}
                </th>
                <th className="px-4 py-3 text-right font-medium">{t("wc.lb_col_weeks_hit")}</th>
                <th className="px-4 py-3 text-left font-medium">{t("wc.lb_col_status")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const isMe = u.id === user?.id;
                const target =
                  month === "all"
                    ? monthlyKpi(u.gender, 6) +
                      monthlyKpi(u.gender, 7) +
                      monthlyKpi(u.gender, 8)
                    : monthlyKpi(u.gender, Number(month));
                const value = u.kcal;
                const hitKpi = value >= target && target > 0;
                const initials = (u.name || "?")
                  .split(" ")
                  .map((s) => s[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <tr
                    key={u.id}
                    className={`border-b border-arena-border/60 last:border-0 ${
                      isMe ? "bg-arena-amber/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <RankBadge rank={u.rank} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full border border-arena-border bg-arena-card grid place-items-center text-[10px] font-semibold overflow-hidden">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            initials
                          )}
                        </span>
                        <span className={isMe ? "text-arena-amber font-medium" : ""}>
                          {u.name}
                          {isMe && (
                            <span className="ml-2 text-[10px] tracking-[0.2em] uppercase text-arena-amber">
                              {t("wc.lb_you_marker")}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-arena-muted">
                      {u.gender === "male"
                        ? t("wc.gender_male")
                        : t("wc.gender_female")}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      <span className={hitKpi ? "text-arena-green" : "text-arena-text"}>
                        {formatNum(value, lang)}
                      </span>
                      <span className="text-arena-muted text-xs ml-1 font-normal">
                        / {formatNum(target, lang)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{u.weeks_hit}</td>
                    <td className="px-4 py-3">
                      {hitKpi ? (
                        <span className="text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded border text-arena-green border-arena-green/30 bg-arena-green/10">
                          {t("wc.lb_status_hit")}
                        </span>
                      ) : (
                        <span className="text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded border text-arena-muted border-arena-border">
                          {t("wc.lb_status_trying")}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function RankBadge({ rank }) {
  if (rank === 1)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-arena-amber text-arena-bg font-bold">
        🥇
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-arena-border text-arena-text font-bold">
        🥈
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-arena-border text-arena-text font-bold">
        🥉
      </span>
    );
  return (
    <span className="font-mono text-arena-muted text-sm tabular-nums">
      #{rank}
    </span>
  );
}
