import { Link } from "react-router-dom";
import { PRIZES, WEEKLY_KPI } from "../lib/data";

export default function Rules() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <p className="text-[10px] tracking-[0.4em] uppercase text-arena-amber">
          🌿 Luật chơi
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold mt-2 leading-tight">
          Chương trình rèn luyện sức khỏe 3 tháng
        </h1>
        <p className="text-sm text-arena-muted mt-3">
          LNP triển khai chương trình{" "}
          <span className="text-arena-text">"Cùng Rèn Luyện Sức Khỏe"</span> nhằm
          hỗ trợ mọi người duy trì thói quen vận động lành mạnh.
        </p>
      </header>

      <Section icon="📅" title="Thời gian tổ chức">
        <p>Tháng 6 – Tháng 8 năm 2026 (3 tháng)</p>
      </Section>

      <Section icon="🏃" title="Hình thức vận động">
        <p>
          Mỗi người tự do lựa chọn loại hình tập luyện phù hợp: chạy bộ, đi bộ,
          đạp xe, bơi lội, tập gym, v.v.
        </p>
        <p className="text-arena-amber mt-2">
          → Tiêu chí đánh giá dựa trên lượng calo tiêu hao (kcal) mỗi tuần.
        </p>
      </Section>

      <Section icon="📊" title="Mục tiêu KPI hàng tuần">
        <div className="rounded-lg border border-arena-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-arena-card">
              <tr className="text-[10px] tracking-[0.2em] uppercase text-arena-muted">
                <th className="px-4 py-2 text-left">Giới</th>
                <th className="px-4 py-2 text-right">Tháng 6</th>
                <th className="px-4 py-2 text-right">Tháng 7</th>
                <th className="px-4 py-2 text-right">Tháng 8</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              <Row gender="Nam" map={WEEKLY_KPI.male} />
              <Row gender="Nữ" map={WEEKLY_KPI.female} />
            </tbody>
          </table>
        </div>
        <p className="text-xs text-arena-muted mt-2">
          ※ Mục tiêu tháng = KPI tuần × 4
        </p>
      </Section>

      <Section icon="📸" title="Quy định ghi nhận kết quả">
        <ul className="space-y-2">
          <Check>Chỉ tính 1 lần/ngày, mỗi lần tập tối đa 120 phút</Check>
          <Check>Bắt buộc có 2 ảnh: trước và sau khi tập</Check>
          <Check>
            Ảnh phải hiển thị rõ ngày, tháng, giờ chụp (dùng app camera có
            timestamp)
          </Check>
          <Check>Ảnh phải hiển thị rõ lượng calo tiêu hao (kcal)</Check>
        </ul>
      </Section>

      <Section icon="📷" title="Cách chụp ảnh (ví dụ: Apple Watch)">
        <ol className="space-y-2 list-decimal pl-5 text-arena-text/90">
          <li>Trước khi tập → chụp màn hình hoạt động (kcal ≈ 0)</li>
          <li>Thực hiện bài tập (chạy, gym...)</li>
          <li>Sau khi tập → chụp màn hình kết quả (hiển thị kcal + giờ kết thúc)</li>
        </ol>
        <div className="mt-4 rounded-lg border border-arena-amber/30 bg-arena-amber/5 p-4 text-sm">
          <p className="font-semibold text-arena-amber mb-1">Ví dụ minh họa</p>
          <p>
            Ảnh 1: 5:09 bắt đầu, kcal ≈ 5 → Ảnh 2: 5:57 kết thúc, kcal = 185 →
            <span className="font-mono text-arena-text"> kết quả ghi nhận: 180 kcal</span>
          </p>
        </div>
      </Section>

      <Section icon="⚠️" title="Ảnh không hợp lệ" tone="danger">
        <ul className="space-y-1 list-disc pl-5 text-arena-text/90">
          <li>Ảnh chụp lại từ màn hình thiết bị khác</li>
          <li>Ảnh bị cắt xén, không thấy ngày giờ hoặc kcal</li>
          <li>Dữ liệu nhập tay</li>
        </ul>
      </Section>

      <Section icon="📤" title="Cách gửi kết quả">
        <p>
          Tải ảnh lên màn hình "Ghi kết quả" trong tuần tập luyện, chậm nhất cuối
          tuần. (Hoặc gửi vào kênh Slack của chương trình theo hướng dẫn.)
        </p>
        <p className="mt-3 font-semibold text-arena-text">Thiết bị được chấp nhận</p>
        <ul className="mt-2 space-y-1 list-disc pl-5">
          <li>Màn hình máy tập tại gym (máy chạy bộ, xe đạp...)</li>
          <li>Apple Watch / Garmin / Fitbit hoặc smartwatch khác</li>
          <li>Ứng dụng Strava (chạy/đạp xe ngoài trời)</li>
          <li>Apple Health / Google Fit (chỉ dùng khi không có các thiết bị trên)</li>
        </ul>
      </Section>

      <Section icon="🏆" title="Cơ cấu giải thưởng">
        <div className="grid sm:grid-cols-3 gap-3">
          {PRIZES.map((p) => (
            <div
              key={p.id}
              className="rounded border border-arena-border bg-arena-card p-4"
            >
              <div className="text-2xl">{p.icon}</div>
              <p className="mt-2 text-sm font-semibold">{p.title}</p>
              <p className="text-xs text-arena-amber font-mono mt-2">
                {p.amount}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <div className="flex items-center justify-between pt-4 border-t border-arena-border">
        <p className="text-sm text-arena-muted">
          Chúc mọi người tập luyện vui vẻ và khỏe mạnh! 💪🔥
        </p>
        <Link
          to="/wellness-challenge/log"
          className="rounded-md bg-arena-amber text-arena-bg px-4 py-2 text-xs font-semibold tracking-wide uppercase hover:brightness-110"
        >
          Bắt đầu ghi buổi tập
        </Link>
      </div>
    </div>
  );
}

function Section({ icon, title, tone, children }) {
  const ring =
    tone === "danger"
      ? "border-arena-red/30"
      : "border-arena-border";
  return (
    <section className={`rounded-lg border ${ring} bg-arena-surface p-5 sm:p-6`}>
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <span className="text-xl">{icon}</span>
        <span>{title}</span>
      </h2>
      <div className="mt-3 text-sm text-arena-text/85 leading-relaxed space-y-1">
        {children}
      </div>
    </section>
  );
}

function Row({ gender, map }) {
  return (
    <tr className="border-t border-arena-border">
      <td className="px-4 py-2 font-sans text-arena-muted">{gender}</td>
      <td className="px-4 py-2 text-right">{map[6].toLocaleString("vi-VN")}</td>
      <td className="px-4 py-2 text-right text-arena-amber">
        {map[7].toLocaleString("vi-VN")}
      </td>
      <td className="px-4 py-2 text-right text-arena-amber font-semibold">
        {map[8].toLocaleString("vi-VN")}
      </td>
    </tr>
  );
}

function Check({ children }) {
  return (
    <li className="flex gap-2 items-start">
      <span className="text-arena-green mt-0.5">✓</span>
      <span>{children}</span>
    </li>
  );
}
