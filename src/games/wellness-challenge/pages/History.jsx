import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../lib/AuthContext";
import { fetchMyEntries, subscribeEntries } from "../lib/wellness";
import {
  PROGRAM,
  findDevice,
  findExercise,
  formatDate,
} from "../lib/data";

const MONTHS = [
  { value: "all", label: "Tất cả" },
  { value: "6", label: "Tháng 6" },
  { value: "7", label: "Tháng 7" },
  { value: "8", label: "Tháng 8" },
];

export default function History() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState("all");
  const [preview, setPreview] = useState(null);

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
            Lịch sử · {filtered.length} buổi · {total.toLocaleString("vi-VN")} kcal
          </p>
          <h1 className="font-display text-3xl font-semibold mt-2">
            Lịch sử tập luyện
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
            Đang tải…
          </p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-sm text-arena-muted text-center">
            Không có buổi tập nào trong khoảng thời gian này.
          </p>
        ) : (
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="text-[10px] tracking-[0.25em] uppercase text-arena-muted border-b border-arena-border">
                <th className="px-4 py-3 text-left font-medium">Ngày</th>
                <th className="px-4 py-3 text-left font-medium">Loại</th>
                <th className="px-4 py-3 text-right font-medium">Thời gian</th>
                <th className="px-4 py-3 text-right font-medium">kcal</th>
                <th className="px-4 py-3 text-left font-medium">Thiết bị</th>
                <th className="px-4 py-3 text-left font-medium">Ảnh</th>
                <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const ex = findExercise(e.exercise_type);
                const dev = findDevice(e.device);
                return (
                  <tr
                    key={e.id}
                    className="border-b border-arena-border/60 last:border-0 hover:bg-arena-card/50"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-arena-muted">
                      {formatDate(e.entry_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-lg">{ex.icon}</span>
                        {ex.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {e.duration_min} <span className="text-arena-muted">ph</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-arena-amber font-semibold">
                      {e.kcal.toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-arena-muted text-xs">
                      {dev?.label || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <PhotoChip url={e.photo_before_url} label="①" onClick={() => setPreview(e.photo_before_url)} />
                        <PhotoChip url={e.photo_after_url} label="②" onClick={() => setPreview(e.photo_after_url)} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      <p className="text-[11px] text-arena-muted">
        Chương trình {PROGRAM.startDate.toLocaleDateString("vi-VN")} —{" "}
        {PROGRAM.endDate.toLocaleDateString("vi-VN")}
      </p>

      {preview && <PhotoModal url={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

function PhotoChip({ url, label, onClick }) {
  if (!url) return <span className="text-arena-muted">—</span>;
  return (
    <button
      onClick={onClick}
      className="w-10 h-10 rounded border border-arena-border overflow-hidden hover:border-arena-amber transition"
      title="Xem ảnh"
    >
      <img src={url} alt={label} className="w-full h-full object-cover" />
    </button>
  );
}

function PhotoModal({ url, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-arena-bg/90 backdrop-blur grid place-items-center p-4"
      onClick={onClose}
    >
      <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-arena-muted hover:text-arena-text text-sm"
          >
            ✕ Đóng
          </button>
        </div>
        <img
          src={url}
          alt=""
          className="w-full max-h-[80vh] object-contain rounded-lg border border-arena-border"
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    approved: {
      label: "Đã duyệt",
      cls: "text-arena-green border-arena-green/30 bg-arena-green/10",
    },
    pending: {
      label: "Chờ duyệt",
      cls: "text-arena-amber border-arena-amber/30 bg-arena-amber/10",
    },
    rejected: {
      label: "Từ chối",
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
