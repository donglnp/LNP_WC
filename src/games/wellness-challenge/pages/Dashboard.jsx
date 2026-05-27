import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Ring from "../components/Ring";
import { useAuth } from "../../../lib/AuthContext";
import { fetchMyEntries, subscribeEntries } from "../lib/wellness";
import {
  PROGRAM,
  PRIZES,
  currentMonthInfo,
  daysLeftInWeek,
  daysUntil,
  findExercise,
  formatDateShort,
  monthlyKpi,
  programProgress,
  programState,
  sumKcalThisMonth,
  sumKcalThisWeek,
  weeklyKpi,
  weeksMetKpi,
} from "../lib/data";

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const state = programState();
  const gender = profile?.gender;
  const monthInfo = currentMonthInfo();
  const weekKpi = gender ? weeklyKpi(gender, monthInfo.month) : 0;
  const monthKpi = gender ? monthlyKpi(gender, monthInfo.month) : 0;
  const weekKcal = sumKcalThisWeek(entries);
  const monthKcal = sumKcalThisMonth(entries);
  const weeksHit = gender ? weeksMetKpi(entries, gender) : 0;
  const progressPct = programProgress();
  const recent = entries.slice(0, 3);
  const weeklyOk = weekKpi > 0 && weekKcal >= weekKpi;
  const monthlyPct =
    monthKpi > 0 ? Math.min(100, Math.round((monthKcal / monthKpi) * 100)) : 0;

  // ---- empty / setup states ----
  if (!profile?.joined_wellness) {
    return (
      <EmptyState
        icon="🌿"
        title="Bạn chưa tham gia Wellness Challenge"
        sub="Liên hệ admin để được thêm vào chương trình."
      />
    );
  }
  if (!gender) {
    return (
      <EmptyState
        icon="⚙️"
        title="Cần thiết lập KPI"
        sub="Admin chưa cập nhật giới tính cho bạn. KPI hàng tuần phụ thuộc vào giới — liên hệ admin để được kích hoạt."
      />
    );
  }
  if (state === "upcoming") {
    const days = daysUntil(PROGRAM.startDate);
    return (
      <EmptyState
        icon="🚦"
        title={`Chương trình bắt đầu sau ${days} ngày`}
        sub={`Ngày khởi động: ${PROGRAM.startDate.toLocaleDateString("vi-VN")}. Hãy đọc luật chơi và chuẩn bị thiết bị đo nhé.`}
        action={
          <Link
            to="/wellness-challenge/rules"
            className="rounded-md border border-arena-amber/40 text-arena-amber px-4 py-2 text-xs font-semibold tracking-wide uppercase hover:bg-arena-amber/10"
          >
            Đọc luật chơi
          </Link>
        }
      />
    );
  }
  if (state === "ended") {
    return (
      <EmptyState
        icon="🏁"
        title="Chương trình đã kết thúc"
        sub="Cảm ơn bạn đã tham gia! Xem bảng xếp hạng để biết kết quả cuối."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="rounded-lg border border-arena-border bg-arena-surface p-5 sm:p-7">
        <div className="flex flex-col lg:flex-row gap-7 items-start lg:items-center">
          <Ring value={weekKcal} max={weekKpi} label="kcal tuần này" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] tracking-[0.4em] uppercase text-arena-amber">
              {monthInfo.label} · Tuần hiện tại
            </p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold leading-tight">
              {weeklyOk ? (
                <>
                  Đã đạt KPI tuần.{" "}
                  <span className="text-arena-amber">Tiếp lửa nào! 🔥</span>
                </>
              ) : (
                <>
                  Cần thêm{" "}
                  <span className="text-arena-amber">
                    {(weekKpi - weekKcal).toLocaleString("vi-VN")} kcal
                  </span>{" "}
                  để đạt KPI tuần.
                </>
              )}
            </h1>
            <p className="mt-2 text-sm text-arena-muted">
              Mục tiêu tuần: {weekKpi.toLocaleString("vi-VN")} kcal · Còn{" "}
              {daysLeftInWeek()} ngày trong tuần
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/wellness-challenge/history"
                className="inline-flex items-center gap-2 rounded-md border border-arena-border hover:border-arena-amber/60 px-4 py-2 text-xs font-semibold tracking-[0.15em] uppercase text-arena-muted hover:text-arena-text"
              >
                Xem lịch sử
              </Link>
              <Link
                to="/wellness-challenge/rules"
                className="inline-flex items-center gap-2 rounded-md border border-arena-border hover:border-arena-amber/60 px-4 py-2 text-xs font-semibold tracking-[0.15em] uppercase text-arena-muted hover:text-arena-text"
              >
                Luật chơi
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tháng hiện tại"
          value={monthKcal.toLocaleString("vi-VN")}
          unit="kcal"
          sub={`${monthlyPct}% mục tiêu ${monthKpi.toLocaleString("vi-VN")}`}
          tone={monthKcal >= monthKpi ? "green" : "amber"}
        />
        <StatCard
          label="Số tuần đạt KPI"
          value={`${weeksHit}`}
          unit="tuần"
          sub="trong 12 tuần chương trình"
          tone="amber"
        />
        <StatCard
          label="Tiến độ chương trình"
          value={`${progressPct}%`}
          unit=""
          sub="Tháng 6 → Tháng 8 năm 2026"
          tone="muted"
        />
        <StatCard
          label="Giới tính · KPI nhóm"
          value={gender === "male" ? "Nam" : "Nữ"}
          unit=""
          sub={`${weekKpi.toLocaleString("vi-VN")} kcal/tuần`}
          tone="muted"
        />
      </section>

      {/* 3-month track */}
      <section className="rounded-lg border border-arena-border bg-arena-surface p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Lộ trình 3 tháng</h2>
          <span className="text-[10px] tracking-[0.3em] uppercase text-arena-muted">
            KPI tăng dần
          </span>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {PROGRAM.months.map((m) => {
            const isCurrent = m.month === monthInfo.month;
            const past = m.month < monthInfo.month;
            return (
              <div
                key={m.month}
                className={`rounded border p-4 ${
                  isCurrent
                    ? "border-arena-amber/60 bg-arena-amber/5"
                    : "border-arena-border bg-arena-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-display text-lg font-semibold">{m.label}</p>
                  <span
                    className={`text-[10px] tracking-[0.25em] uppercase ${
                      isCurrent
                        ? "text-arena-amber"
                        : past
                        ? "text-arena-green"
                        : "text-arena-muted"
                    }`}
                  >
                    {isCurrent ? "Đang diễn ra" : past ? "Đã qua" : "Sắp tới"}
                  </span>
                </div>
                <p className="mt-2 font-mono text-sm text-arena-text">
                  {weeklyKpi(gender, m.month).toLocaleString("vi-VN")} / tuần
                </p>
                <p className="text-xs text-arena-muted">
                  Tháng: {monthlyKpi(gender, m.month).toLocaleString("vi-VN")} kcal
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        <section className="rounded-lg border border-arena-border bg-arena-surface">
          <div className="flex items-center justify-between px-5 py-4 border-b border-arena-border">
            <h2 className="text-sm font-semibold">Buổi tập gần đây</h2>
            <Link
              to="/wellness-challenge/history"
              className="text-[10px] tracking-[0.25em] uppercase text-arena-muted hover:text-arena-text"
            >
              Xem tất cả →
            </Link>
          </div>
          {loading ? (
            <p className="px-5 py-8 text-sm text-arena-muted text-center">
              Đang tải…
            </p>
          ) : recent.length === 0 ? (
            <p className="px-5 py-8 text-sm text-arena-muted text-center">
              Chưa có buổi tập nào — admin sẽ ghi nhận sau khi bạn gửi ảnh qua Slack.
            </p>
          ) : (
            <ul className="divide-y divide-arena-border/60">
              {recent.map((e) => {
                const ex = findExercise(e.exercise_type);
                return (
                  <li
                    key={e.id}
                    className="px-5 py-4 flex items-center gap-4"
                  >
                    <span className="text-2xl">{ex.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{ex.label}</p>
                      <p className="text-xs text-arena-muted">
                        {formatDateShort(e.entry_date)} · {e.duration_min} phút
                      </p>
                    </div>
                    <p className="font-mono text-arena-amber font-semibold">
                      {e.kcal.toLocaleString("vi-VN")}
                      <span className="text-arena-muted text-xs ml-1">kcal</span>
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-arena-border bg-arena-surface">
          <div className="px-5 py-4 border-b border-arena-border">
            <h2 className="text-sm font-semibold">🏆 Cơ cấu giải thưởng</h2>
          </div>
          <ul className="divide-y divide-arena-border/60">
            {PRIZES.map((p) => (
              <li key={p.id} className="px-5 py-4 flex items-start gap-4">
                <span className="text-2xl">{p.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-arena-amber font-mono mt-1">
                    {p.amount}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, unit, sub, tone = "muted" }) {
  const toneClass =
    tone === "green"
      ? "text-arena-green"
      : tone === "amber"
      ? "text-arena-amber"
      : "text-arena-text";
  return (
    <div className="rounded-lg border border-arena-border bg-arena-surface p-4">
      <p className="text-[10px] tracking-[0.3em] uppercase text-arena-muted">
        {label}
      </p>
      <p className="mt-3 font-display text-2xl sm:text-3xl font-semibold">
        <span className={toneClass}>{value}</span>
        {unit && (
          <span className="text-arena-muted text-sm ml-1.5 font-normal">
            {unit}
          </span>
        )}
      </p>
      <p className="text-[11px] text-arena-muted mt-1">{sub}</p>
    </div>
  );
}

function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="rounded-lg border border-arena-border bg-arena-surface p-10 sm:p-14 text-center">
      <div className="text-5xl">{icon}</div>
      <h1 className="mt-4 font-display text-2xl sm:text-3xl font-semibold">
        {title}
      </h1>
      <p className="mt-3 text-sm text-arena-muted max-w-md mx-auto">{sub}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
