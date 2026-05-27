import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../lib/AuthContext";
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

const GENDER_TABS = [
  { value: "all", label: "Tất cả" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
];

const SCOPE_TABS = [
  { value: "month", label: "Tháng này" },
  { value: "total", label: "Tổng 3 tháng" },
];

export default function Leaderboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gender, setGender] = useState("all");
  const [scope, setScope] = useState("month");
  const monthInfo = currentMonthInfo();

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
        const monthKcal = sumKcalInMonth(own, monthInfo.month);
        const totalKcal = sumKcalTotal(own);
        return {
          id: p.id,
          name: p.full_name || p.email,
          gender: p.gender,
          avatar: p.avatar_url,
          month_kcal: monthKcal,
          total_kcal: totalKcal,
          weeks_hit: weeksMetKpi(own, p.gender),
        };
      })
      .sort((a, b) =>
        scope === "month"
          ? b.month_kcal - a.month_kcal
          : b.total_kcal - a.total_kcal
      )
      .map((r, i) => ({ ...r, rank: i + 1 }));
  }, [profiles, entries, gender, scope, monthInfo.month]);

  return (
    <div className="space-y-5">
      <header>
        <p className="text-[10px] tracking-[0.4em] uppercase text-arena-amber">
          Bảng xếp hạng · {monthInfo.label} 2026
        </p>
        <h1 className="font-display text-3xl font-semibold mt-2">
          Top calo tiêu hao
        </h1>
        <p className="text-sm text-arena-muted mt-1">
          Người dẫn đầu mỗi giới sẽ được tặng 500.000 VND vào cuối tháng.
        </p>
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
          {SCOPE_TABS.map((s) => (
            <button
              key={s.value}
              onClick={() => setScope(s.value)}
              className={`px-3 py-1.5 text-xs rounded transition ${
                scope === s.value
                  ? "bg-arena-amber text-arena-bg"
                  : "text-arena-muted hover:text-arena-text"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-lg border border-arena-border bg-arena-surface overflow-x-auto">
        {loading ? (
          <p className="py-12 text-sm text-arena-muted text-center">Đang tải…</p>
        ) : rows.length === 0 ? (
          <p className="py-12 text-sm text-arena-muted text-center">
            Chưa có người tham gia nào. Admin cần thêm thành viên vào chương trình.
          </p>
        ) : (
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-[10px] tracking-[0.25em] uppercase text-arena-muted border-b border-arena-border">
                <th className="px-4 py-3 text-left font-medium w-16">#</th>
                <th className="px-4 py-3 text-left font-medium">Tên</th>
                <th className="px-4 py-3 text-left font-medium">Giới</th>
                <th className="px-4 py-3 text-right font-medium">
                  {scope === "month" ? "kcal tháng" : "kcal 3 tháng"}
                </th>
                <th className="px-4 py-3 text-right font-medium">Tuần đạt KPI</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => {
                const isMe = u.id === user?.id;
                const target =
                  scope === "month"
                    ? monthlyKpi(u.gender, monthInfo.month)
                    : monthlyKpi(u.gender, 6) +
                      monthlyKpi(u.gender, 7) +
                      monthlyKpi(u.gender, 8);
                const value = scope === "month" ? u.month_kcal : u.total_kcal;
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
                              · bạn
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-arena-muted">
                      {u.gender === "male" ? "Nam" : "Nữ"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold">
                      <span className={hitKpi ? "text-arena-green" : "text-arena-text"}>
                        {value.toLocaleString("vi-VN")}
                      </span>
                      <span className="text-arena-muted text-xs ml-1 font-normal">
                        / {target.toLocaleString("vi-VN")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{u.weeks_hit}</td>
                    <td className="px-4 py-3">
                      {hitKpi ? (
                        <span className="text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded border text-arena-green border-arena-green/30 bg-arena-green/10">
                          Đạt KPI
                        </span>
                      ) : (
                        <span className="text-[10px] tracking-[0.15em] uppercase px-2 py-1 rounded border text-arena-muted border-arena-border">
                          Đang cố
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
