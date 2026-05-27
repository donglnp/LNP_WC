import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import {
  fetchAllEntries,
  fetchWellnessProfiles,
  upsertEntry,
  deleteEntry,
  updateProfileMeta,
} from "../games/wellness-challenge/lib/wellness";
import {
  DEVICES,
  EXERCISE_TYPES,
  findDevice,
  findExercise,
  formatDate,
} from "../games/wellness-challenge/lib/data";

const TABS = [
  { id: "entries", label: "Buổi tập" },
  { id: "users", label: "Người tham gia" },
];

export default function Admin() {
  const { user, refreshProfile } = useAuth();
  const [tab, setTab] = useState("entries");
  const [profiles, setProfiles] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  async function reload() {
    setLoading(true);
    const [profs, ents] = await Promise.all([
      fetchWellnessProfiles(),
      fetchAllEntries(),
    ]);
    setProfiles(profs);
    setEntries(ents);
    setLoading(false);
  }

  useEffect(() => {
    reload();
  }, []);

  function showToast(text, type = "success") {
    setToast({ text, type });
    setTimeout(() => setToast(null), 2500);
  }

  return (
    <div className="min-h-screen bg-arena-bg text-arena-text">
      <header className="border-b border-arena-border bg-arena-bg/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <Link
            to="/"
            className="shrink-0 flex items-center gap-2"
            title="Back to Hub"
          >
            <span className="w-2 h-2 rounded-full bg-arena-amber shadow-[0_0_8px_#F5C451]" />
            <span className="font-display font-semibold tracking-tight text-lg">
              LNP Hub<span className="text-arena-amber">.</span>
              <span className="ml-2 text-[10px] tracking-[0.3em] uppercase text-arena-muted font-normal align-middle">
                Admin
              </span>
            </span>
          </Link>
          <span className="ml-auto text-xs text-arena-muted">{user?.email}</span>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 -mb-px">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm border-b-2 transition ${
                tab === t.id
                  ? "border-arena-amber text-arena-amber"
                  : "border-transparent text-arena-muted hover:text-arena-text"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <p className="py-12 text-sm text-arena-muted text-center">Đang tải…</p>
        ) : tab === "entries" ? (
          <EntriesTab
            entries={entries}
            profiles={profiles}
            onEdit={setEditing}
            onAdd={() => setEditing({})}
            onDelete={async (id) => {
              if (!confirm("Xoá buổi tập này?")) return;
              try {
                await deleteEntry(id);
                await reload();
                showToast("Đã xoá");
              } catch (e) {
                showToast(e.message, "error");
              }
            }}
          />
        ) : (
          <UsersTab
            profiles={profiles}
            currentUserId={user?.id}
            onChange={async (id, patch) => {
              try {
                await updateProfileMeta(id, patch);
                await reload();
                if (id === user?.id) await refreshProfile();
                showToast("Đã cập nhật");
              } catch (e) {
                showToast(e.message, "error");
              }
            }}
          />
        )}
      </main>

      {editing !== null && (
        <EntryModal
          entry={editing}
          profiles={profiles}
          onClose={() => setEditing(null)}
          onSave={async (payload) => {
            try {
              await upsertEntry(payload);
              setEditing(null);
              await reload();
              showToast(payload.id ? "Đã cập nhật buổi tập" : "Đã thêm buổi tập");
            } catch (e) {
              showToast(e.message, "error");
            }
          }}
        />
      )}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-3 rounded-md text-sm shadow-lg border ${
            toast.type === "error"
              ? "bg-arena-red/15 border-arena-red/40 text-arena-red"
              : "bg-arena-green/15 border-arena-green/40 text-arena-green"
          }`}
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Entries tab
// ============================================================
function EntriesTab({ entries, profiles, onEdit, onAdd, onDelete }) {
  const [search, setSearch] = useState("");
  const [filterUser, setFilterUser] = useState("all");
  const profileById = useMemo(
    () => Object.fromEntries(profiles.map((p) => [p.id, p])),
    [profiles]
  );

  const filtered = useMemo(() => {
    let list = entries;
    if (filterUser !== "all") list = list.filter((e) => e.user_id === filterUser);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((e) => {
        const p = profileById[e.user_id];
        return (
          p?.full_name?.toLowerCase().includes(q) ||
          p?.email?.toLowerCase().includes(q)
        );
      });
    }
    return list;
  }, [entries, search, filterUser, profileById]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl font-semibold mr-auto">
          Buổi tập · {filtered.length}
        </h2>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên / email…"
          className="input max-w-xs"
        />
        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="input max-w-xs"
        >
          <option value="all">Tất cả người</option>
          {profiles
            .filter((p) => p.joined_wellness)
            .map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name || p.email}
              </option>
            ))}
        </select>
        <button
          onClick={onAdd}
          className="rounded-md bg-arena-amber text-arena-bg px-4 py-2 text-xs font-semibold tracking-wide uppercase hover:brightness-110"
        >
          + Thêm buổi tập
        </button>
      </div>

      <div className="rounded-lg border border-arena-border bg-arena-surface overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="py-12 text-sm text-arena-muted text-center">
            Chưa có buổi tập nào.
          </p>
        ) : (
          <table className="w-full text-sm min-w-[860px]">
            <thead>
              <tr className="text-[10px] tracking-[0.25em] uppercase text-arena-muted border-b border-arena-border">
                <th className="px-4 py-3 text-left">Người</th>
                <th className="px-4 py-3 text-left">Ngày</th>
                <th className="px-4 py-3 text-left">Loại</th>
                <th className="px-4 py-3 text-right">Phút</th>
                <th className="px-4 py-3 text-right">kcal</th>
                <th className="px-4 py-3 text-left">Thiết bị</th>
                <th className="px-4 py-3 text-left">Ảnh</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const p = profileById[e.user_id];
                const ex = findExercise(e.exercise_type);
                const dev = findDevice(e.device);
                return (
                  <tr
                    key={e.id}
                    className="border-b border-arena-border/60 last:border-0 hover:bg-arena-card/40"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium">{p?.full_name || "—"}</p>
                      <p className="text-[11px] text-arena-muted">{p?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-arena-muted whitespace-nowrap">
                      {formatDate(e.entry_date)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-lg">{ex.icon}</span>
                        {ex.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {e.duration_min}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-arena-amber font-semibold">
                      {e.kcal.toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-3 text-xs text-arena-muted">
                      {dev?.label || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <PhotoChip url={e.photo_before_url} />
                        <PhotoChip url={e.photo_after_url} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => onEdit(e)}
                        className="text-xs text-arena-amber hover:underline mr-3"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => onDelete(e.id)}
                        className="text-xs text-arena-red hover:underline"
                      >
                        Xoá
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Users tab
// ============================================================
function UsersTab({ profiles, currentUserId, onChange }) {
  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold">
        Người tham gia · {profiles.length}
      </h2>
      <p className="text-sm text-arena-muted">
        Đặt giới tính để KPI hoạt động. Toggle "Tham gia" để loại khỏi bảng xếp
        hạng. Cấp quyền admin một cách thận trọng.
      </p>

      <div className="rounded-lg border border-arena-border bg-arena-surface overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-[10px] tracking-[0.25em] uppercase text-arena-muted border-b border-arena-border">
              <th className="px-4 py-3 text-left">Tên</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3 text-left">Giới</th>
              <th className="px-4 py-3 text-center">Tham gia</th>
              <th className="px-4 py-3 text-center">Admin</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr
                key={p.id}
                className="border-b border-arena-border/60 last:border-0"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full border border-arena-border bg-arena-card grid place-items-center text-[10px] font-semibold overflow-hidden">
                      {p.avatar_url ? (
                        <img
                          src={p.avatar_url}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (p.full_name || "?")
                          .split(" ")
                          .map((s) => s[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()
                      )}
                    </span>
                    <span>{p.full_name || "—"}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-arena-muted text-xs">{p.email}</td>
                <td className="px-4 py-3">
                  <select
                    value={p.gender || ""}
                    onChange={(e) =>
                      onChange(p.id, { gender: e.target.value || null })
                    }
                    className="input max-w-[140px] text-xs"
                  >
                    <option value="">— Chưa đặt —</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <Toggle
                    checked={!!p.joined_wellness}
                    onChange={(v) => onChange(p.id, { joined_wellness: v })}
                  />
                </td>
                <td className="px-4 py-3 text-center">
                  <Toggle
                    checked={!!p.is_admin}
                    onChange={(v) => onChange(p.id, { is_admin: v })}
                    disabled={p.id === currentUserId}
                    title={
                      p.id === currentUserId
                        ? "Không thể tự huỷ quyền admin của mình"
                        : ""
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============================================================
// Entry modal (add / edit)
// ============================================================
function EntryModal({ entry, profiles, onClose, onSave }) {
  const isEdit = !!entry.id;
  const [form, setForm] = useState({
    id: entry.id || undefined,
    user_id: entry.user_id || profiles.find((p) => p.joined_wellness)?.id || "",
    entry_date: entry.entry_date || new Date().toISOString().slice(0, 10),
    exercise_type: entry.exercise_type || "run",
    duration_min: entry.duration_min || "",
    kcal: entry.kcal || "",
    device: entry.device || "apple_watch",
    photo_before_url: entry.photo_before_url || "",
    photo_after_url: entry.photo_after_url || "",
    status: entry.status || "approved",
    notes: entry.notes || "",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.user_id) e.user_id = "Chọn người tham gia";
    if (!form.entry_date) e.entry_date = "Chọn ngày";
    const dur = Number(form.duration_min);
    if (!dur || dur <= 0 || dur > 120) e.duration_min = "1-120 phút";
    const k = Number(form.kcal);
    if (!k || k <= 0) e.kcal = "Bắt buộc > 0";
    if (!form.photo_before_url.trim()) e.photo_before_url = "URL ảnh trước";
    if (!form.photo_after_url.trim()) e.photo_after_url = "URL ảnh sau";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-arena-bg/85 backdrop-blur grid place-items-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-lg border border-arena-border bg-arena-surface my-8"
      >
        <header className="px-5 py-4 border-b border-arena-border flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">
            {isEdit ? "Sửa buổi tập" : "Thêm buổi tập"}
          </h2>
          <button
            onClick={onClose}
            className="text-arena-muted hover:text-arena-text text-sm"
          >
            ✕
          </button>
        </header>
        <form onSubmit={submit} className="p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Người tham gia" error={errors.user_id}>
              <select
                value={form.user_id}
                onChange={(e) => set("user_id", e.target.value)}
                className="input"
                disabled={isEdit}
              >
                {profiles
                  .filter((p) => p.joined_wellness || p.id === form.user_id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {(p.full_name || p.email) +
                        (p.gender
                          ? p.gender === "male"
                            ? " (Nam)"
                            : " (Nữ)"
                          : " (chưa set giới)")}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="Ngày tập" error={errors.entry_date}>
              <input
                type="date"
                value={form.entry_date}
                onChange={(e) => set("entry_date", e.target.value)}
                className="input"
              />
            </Field>
          </div>

          <Field label="Loại hình">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {EXERCISE_TYPES.map((ex) => (
                <button
                  type="button"
                  key={ex.id}
                  onClick={() => set("exercise_type", ex.id)}
                  className={`rounded border px-2 py-2 text-xs flex flex-col items-center gap-1 transition ${
                    form.exercise_type === ex.id
                      ? "border-arena-amber bg-arena-amber/10 text-arena-amber"
                      : "border-arena-border bg-arena-card text-arena-muted hover:text-arena-text"
                  }`}
                >
                  <span className="text-lg">{ex.icon}</span>
                  <span className="leading-none">{ex.label}</span>
                </button>
              ))}
            </div>
          </Field>

          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Phút (≤120)" error={errors.duration_min}>
              <input
                type="number"
                min="1"
                max="120"
                value={form.duration_min}
                onChange={(e) => set("duration_min", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Calo (kcal)" error={errors.kcal}>
              <input
                type="number"
                min="1"
                value={form.kcal}
                onChange={(e) => set("kcal", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Thiết bị">
              <select
                value={form.device}
                onChange={(e) => set("device", e.target.value)}
                className="input"
              >
                {DEVICES.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="URL ảnh TRƯỚC khi tập" error={errors.photo_before_url}>
            <input
              type="url"
              value={form.photo_before_url}
              onChange={(e) => set("photo_before_url", e.target.value)}
              placeholder="https://…/before.jpg"
              className="input"
            />
            {form.photo_before_url && (
              <PreviewImg url={form.photo_before_url} />
            )}
          </Field>

          <Field label="URL ảnh SAU khi tập" error={errors.photo_after_url}>
            <input
              type="url"
              value={form.photo_after_url}
              onChange={(e) => set("photo_after_url", e.target.value)}
              placeholder="https://…/after.jpg"
              className="input"
            />
            {form.photo_after_url && (
              <PreviewImg url={form.photo_after_url} />
            )}
          </Field>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Trạng thái">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="input"
              >
                <option value="approved">Đã duyệt</option>
                <option value="pending">Chờ duyệt</option>
                <option value="rejected">Từ chối</option>
              </select>
            </Field>
            <Field label="Ghi chú (tuỳ chọn)">
              <input
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="Source Slack link, comment…"
                className="input"
              />
            </Field>
          </div>

          <footer className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs tracking-wide uppercase text-arena-muted hover:text-arena-text"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-arena-amber text-arena-bg px-5 py-2.5 text-sm font-semibold tracking-wide uppercase hover:brightness-110 disabled:opacity-50"
            >
              {saving ? "Đang lưu…" : isEdit ? "Lưu thay đổi" : "Thêm"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Small bits
// ============================================================
function Field({ label, children, error }) {
  return (
    <label className="block">
      <span className="block text-[11px] tracking-[0.2em] uppercase text-arena-muted mb-2">
        {label}
      </span>
      {children}
      {error && (
        <span className="block mt-1 text-[11px] text-arena-red">{error}</span>
      )}
    </label>
  );
}

function PreviewImg({ url }) {
  return (
    <div className="mt-2 w-28 h-20 rounded border border-arena-border overflow-hidden bg-arena-card">
      <img
        src={url}
        alt=""
        className="w-full h-full object-cover"
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
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
      className="w-10 h-10 rounded border border-arena-border overflow-hidden hover:border-arena-amber block"
    >
      <img src={url} alt="" className="w-full h-full object-cover" />
    </a>
  );
}

function StatusBadge({ status }) {
  const map = {
    approved: { label: "Đã duyệt", cls: "text-arena-green border-arena-green/30 bg-arena-green/10" },
    pending: { label: "Chờ duyệt", cls: "text-arena-amber border-arena-amber/30 bg-arena-amber/10" },
    rejected: { label: "Từ chối", cls: "text-arena-red border-arena-red/30 bg-arena-red/10" },
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

function Toggle({ checked, onChange, disabled, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative w-10 h-5 rounded-full transition ${
        checked ? "bg-arena-amber" : "bg-arena-border"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-arena-bg transition ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}
