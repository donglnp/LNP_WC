import { createContext, useContext, useEffect, useState } from "react";

export const LANGS = [
  { code: "en", label: "English", short: "EN", flag: "🇬🇧" },
  { code: "vi", label: "Tiếng Việt", short: "VI", flag: "🇻🇳" },
  { code: "ja", label: "日本語", short: "JA", flag: "🇯🇵" },
];

const STORAGE_KEY = "arena-lang";

const dict = {
  // ---------- Common ----------
  "common.system_online": {
    en: "◆ System Online",
    vi: "◆ Hệ thống đang hoạt động",
    ja: "◆ システム稼働中",
  },
  "common.copyright": {
    en: "© 2026 LNP Technologies Inc.",
    vi: "© 2026 LNP Technologies Inc.",
    ja: "© 2026 LNP Technologies Inc.",
  },
  "common.source": { en: "source", vi: "nguồn", ja: "ソース" },
  "common.loading": { en: "Loading…", vi: "Đang tải…", ja: "読み込み中…" },
  "common.saving": { en: "Saving…", vi: "Đang lưu…", ja: "保存中…" },
  "common.you": { en: "You", vi: "Bạn", ja: "あなた" },

  // ---------- Nav ----------
  "nav.dashboard": { en: "Dashboard", vi: "Tổng quan", ja: "ダッシュボード" },
  "nav.matches": { en: "Matches", vi: "Trận đấu", ja: "試合" },
  "nav.leaderboard": {
    en: "Leaderboard",
    vi: "Bảng xếp hạng",
    ja: "ランキング",
  },

  // ---------- Login ----------
  "login.title_1": { en: "Enter the", vi: "Bước vào", ja: "アリーナへ" },
  "login.title_2": { en: "Arena.", vi: "Đấu trường.", ja: "入場。" },
  "login.title_3": { en: "Predict the", vi: "Dự đoán", ja: "ワールドカップを" },
  "login.title_4": { en: "Cup.", vi: "World Cup.", ja: "予想しよう。" },
  "login.subtitle": {
    en: "We'll email you a one-click sign-in link — no password required.",
    vi: "Chúng tôi sẽ gửi link đăng nhập 1 chạm qua email — không cần mật khẩu.",
    ja: "ワンクリックでサインインできるリンクをメールでお送りします。パスワード不要。",
  },
  "login.email_label": {
    en: "Work email",
    vi: "Email công ty",
    ja: "勤務先メール",
  },
  "login.email_placeholder": {
    en: "you@lnp.co",
    vi: "ban@lnp.co",
    ja: "you@lnp.co",
  },
  "login.send": {
    en: "Send Magic Link",
    vi: "Gửi liên kết đăng nhập",
    ja: "ログインリンクを送信",
  },
  "login.sending": {
    en: "Sending link…",
    vi: "Đang gửi…",
    ja: "送信中…",
  },
  "login.sent_title": {
    en: "◆ Check your inbox",
    vi: "◆ Kiểm tra hộp thư",
    ja: "◆ メールをご確認ください",
  },
  "login.sent_body": {
    en: "We sent a magic link to {email}. Click it from this device to enter the arena.",
    vi: "Đã gửi liên kết đến {email}. Mở liên kết trên thiết bị này để vào ứng dụng.",
    ja: "{email} 宛にログインリンクを送信しました。このデバイスでリンクを開いてください。",
  },
  "login.use_diff": {
    en: "Use a different email",
    vi: "Dùng email khác",
    ja: "別のメールを使う",
  },
  "login.err_email": {
    en: "Enter a valid email address.",
    vi: "Email không hợp lệ.",
    ja: "有効なメールアドレスを入力してください。",
  },
  "login.err_supabase": {
    en: "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.",
    vi: "Supabase chưa được cấu hình. Thiết lập VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong .env.",
    ja: "Supabase が未設定です。.env に VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY を設定してください。",
  },
  "login.env_missing": {
    en: "Supabase env vars missing — see .env.example.",
    vi: "Thiếu biến môi trường Supabase — xem .env.example.",
    ja: "Supabase 環境変数が未設定 — .env.example を参照してください。",
  },

  // ---------- Dashboard ----------
  "dash.up_next": { en: "Up Next", vi: "Trận kế tiếp", ja: "次の試合" },
  "dash.starts_in": { en: "STARTS IN", vi: "BẮT ĐẦU SAU", ja: "開始まで" },
  "dash.group": { en: "Group", vi: "Bảng", ja: "グループ" },
  "dash.later_today": {
    en: "Later Today",
    vi: "Tiếp theo hôm nay",
    ja: "本日の残り",
  },
  "dash.no_more": {
    en: "No more matches in queue.",
    vi: "Không còn trận nào trong hàng đợi.",
    ja: "他に予定されている試合はありません。",
  },
  "dash.my_stats": {
    en: "My Stats",
    vi: "Thống kê của tôi",
    ja: "マイ統計",
  },
  "dash.current_rank": {
    en: "Current Rank",
    vi: "Hạng hiện tại",
    ja: "現在の順位",
  },
  "dash.total_pts": { en: "Total Pts", vi: "Tổng điểm", ja: "合計ポイント" },
  "dash.locked": {
    en: "Locked",
    vi: "Đã khóa",
    ja: "ロック済み",
  },
  "dash.top5": { en: "Top 5", vi: "Top 5", ja: "トップ5" },
  "dash.no_predictions": {
    en: "No predictions yet. Be the first!",
    vi: "Chưa có dự đoán nào. Hãy là người đầu tiên!",
    ja: "予想はまだありません。最初の予想者になろう！",
  },
  "dash.edit_prediction": {
    en: "Edit Prediction",
    vi: "Sửa dự đoán",
    ja: "予想を編集",
  },
  "dash.lock_prediction": {
    en: "Lock Prediction",
    vi: "Khóa dự đoán",
    ja: "予想をロック",
  },
  "dash.pts": { en: "pts", vi: "điểm", ja: "pt" },
  "dash.pending": { en: "Pending", vi: "Chờ", ja: "保留中" },
  "dash.locked_badge": {
    en: "● Locked",
    vi: "● Đã khóa",
    ja: "● ロック済み",
  },

  // ---------- Matches ----------
  "matches.title": {
    en: "Match Center",
    vi: "Trung tâm trận đấu",
    ja: "マッチセンター",
  },
  "matches.all": {
    en: "All Matches",
    vi: "Tất cả trận",
    ja: "すべての試合",
  },
  "matches.knockouts": {
    en: "Knockouts",
    vi: "Vòng loại trực tiếp",
    ja: "決勝トーナメント",
  },
  "matches.none": {
    en: "No matches available.",
    vi: "Không có trận nào.",
    ja: "試合がありません。",
  },
  "matches.edit": { en: "Edit", vi: "Sửa", ja: "編集" },
  "matches.save": { en: "Save", vi: "Lưu", ja: "保存" },
  "matches.lock_in": { en: "Lock In", vi: "Khóa", ja: "ロック" },
  "status.locked": {
    en: "Prediction Locked",
    vi: "Đã khóa dự đoán",
    ja: "予想ロック済み",
  },
  "status.editing": { en: "Editing", vi: "Đang sửa", ja: "編集中" },
  "status.pending": { en: "Pending", vi: "Chờ", ja: "保留中" },

  // ---------- Leaderboard ----------
  "lb.title": {
    en: "Company Leaderboard",
    vi: "Bảng xếp hạng công ty",
    ja: "社内ランキング",
  },
  "lb.subtitle": {
    en: "Global rankings updated in real-time after every match.",
    vi: "Bảng xếp hạng cập nhật trực tiếp sau mỗi trận.",
    ja: "試合ごとにリアルタイムで更新されます。",
  },
  "lb.your_rank": { en: "Your Rank", vi: "Hạng của bạn", ja: "あなたの順位" },
  "lb.your_points": {
    en: "Your Points",
    vi: "Điểm của bạn",
    ja: "あなたのポイント",
  },
  "lb.col_rank": { en: "Rank", vi: "Hạng", ja: "順位" },
  "lb.col_employee": { en: "Employee", vi: "Nhân viên", ja: "社員" },
  "lb.col_exact": {
    en: "Exact Scores",
    vi: "Tỉ số chính xác",
    ja: "完全一致" ,
  },
  "lb.col_correct": {
    en: "Correct Results",
    vi: "Kết quả đúng",
    ja: "結果正解",
  },
  "lb.col_points": {
    en: "Total Points",
    vi: "Tổng điểm",
    ja: "合計ポイント",
  },
  "lb.empty": {
    en: "No predictions yet. Be the first to play!",
    vi: "Chưa có dự đoán nào. Hãy là người đầu tiên!",
    ja: "予想はまだありません。最初の参加者になろう！",
  },

  // ---------- Profile ----------
  "profile.rank": { en: "Rank", vi: "Hạng", ja: "順位" },
  "profile.total_points": {
    en: "Total Points",
    vi: "Tổng điểm",
    ja: "合計ポイント",
  },
  "profile.sign_out": { en: "Sign out", vi: "Đăng xuất", ja: "サインアウト" },
  "profile.accuracy_breakdown": {
    en: "Accuracy Breakdown",
    vi: "Phân tích độ chính xác",
    ja: "正答率の内訳",
  },
  "profile.exact_matches": {
    en: "Exact Matches",
    vi: "Tỉ số chính xác",
    ja: "完全一致",
  },
  "profile.correct_outcomes": {
    en: "Correct Outcomes",
    vi: "Kết quả đúng",
    ja: "結果正解",
  },
  "profile.locked_predictions": {
    en: "Locked Predictions",
    vi: "Dự đoán đã khóa",
    ja: "ロック済み予想",
  },
  "profile.accuracy": { en: "Accuracy", vi: "Độ chính xác", ja: "正答率" },
  "profile.history": {
    en: "Prediction History",
    vi: "Lịch sử dự đoán",
    ja: "予想履歴",
  },
  "profile.empty": {
    en: "You haven't made any predictions yet. Head to Matches to start.",
    vi: "Bạn chưa có dự đoán nào. Vào Trận đấu để bắt đầu.",
    ja: "まだ予想していません。試合ページで始めましょう。",
  },
  "profile.col_match": { en: "Match", vi: "Trận", ja: "試合" },
  "profile.col_prediction": {
    en: "Your Prediction",
    vi: "Dự đoán của bạn",
    ja: "あなたの予想",
  },
  "profile.col_status": { en: "Status", vi: "Trạng thái", ja: "状態" },
  "profile.col_updated": {
    en: "Updated",
    vi: "Cập nhật",
    ja: "更新日時",
  },
  "profile.status_locked": {
    en: "Locked",
    vi: "Đã khóa",
    ja: "ロック済み",
  },
  "profile.status_editing": {
    en: "Editing",
    vi: "Đang sửa",
    ja: "編集中",
  },

  // ---------- TeamSheet ----------
  "team.coach": { en: "Coach", vi: "HLV", ja: "監督" },
  "team.empty": {
    en: "Squad data not available yet.",
    vi: "Chưa có dữ liệu đội hình.",
    ja: "選手データはまだ利用できません。",
  },
  "team.col_name": { en: "Player", vi: "Cầu thủ", ja: "選手" },
  "team.col_role": { en: "Position", vi: "Vị trí", ja: "ポジション" },
  "team.col_age": { en: "Age", vi: "Tuổi", ja: "年齢" },
  "team.pos_goalkeeper": {
    en: "Goalkeepers",
    vi: "Thủ môn",
    ja: "ゴールキーパー",
  },
  "team.pos_defence": { en: "Defenders", vi: "Hậu vệ", ja: "ディフェンダー" },
  "team.pos_midfield": {
    en: "Midfielders",
    vi: "Tiền vệ",
    ja: "ミッドフィルダー",
  },
  "team.pos_offence": { en: "Forwards", vi: "Tiền đạo", ja: "フォワード" },
  "team.pos_other": { en: "Other", vi: "Khác", ja: "その他" },

  // ---------- Matches view toggle + bracket ----------
  "matches.view_list": { en: "List", vi: "Danh sách", ja: "リスト" },
  "matches.view_bracket": { en: "Bracket", vi: "Sơ đồ", ja: "トーナメント表" },
  "bracket.empty": {
    en: "Knockout bracket will appear here once the group stage concludes.",
    vi: "Sơ đồ vòng loại trực tiếp sẽ hiện khi vòng bảng kết thúc.",
    ja: "グループステージ終了後にトーナメント表が表示されます。",
  },
  "bracket.tbd": { en: "TBD", vi: "Chưa xác định", ja: "未定" },
  "bracket.r32": {
    en: "Round of 32",
    vi: "Vòng 1/16",
    ja: "ラウンド32",
  },
  "bracket.r16": {
    en: "Round of 16",
    vi: "Vòng 1/8",
    ja: "ラウンド16",
  },
  "bracket.qf": { en: "Quarter-finals", vi: "Tứ kết", ja: "準々決勝" },
  "bracket.sf": { en: "Semi-finals", vi: "Bán kết", ja: "準決勝" },
  "bracket.f": { en: "Final", vi: "Chung kết", ja: "決勝" },
  "bracket.tp": {
    en: "Third Place",
    vi: "Tranh hạng 3",
    ja: "3位決定戦",
  },

  // ---------- Rules ----------
  "rules.cta": { en: "How it works", vi: "Cách chơi", ja: "ルール" },
  "rules.title": {
    en: "How LNP Arena Works",
    vi: "Luật chơi LNP Arena",
    ja: "LNP Arena ルール",
  },
  "rules.section_scoring": {
    en: "Scoring",
    vi: "Cách tính điểm",
    ja: "得点方式",
  },
  "rules.scoring_exact": {
    en: "Exact score — predict the final score correctly (e.g. 2-1 vs actual 2-1).",
    vi: "Tỉ số chính xác — dự đoán đúng tỉ số (vd. 2-1 đúng với kết quả 2-1).",
    ja: "完全一致 — 正確なスコアを当てる（例：2-1 で実際も 2-1）。",
  },
  "rules.scoring_correct": {
    en: "Correct outcome — predict the right winner or a draw, but wrong score (e.g. 2-1 vs actual 3-0).",
    vi: "Kết quả đúng — đoán đúng đội thắng hoặc hòa nhưng sai tỉ số (vd. 2-1 và thực tế 3-0).",
    ja: "結果正解 — 勝者または引き分けを当てるがスコアは違う（例：2-1 で実際 3-0）。",
  },
  "rules.scoring_wrong": {
    en: "Wrong — anything else.",
    vi: "Sai — mọi trường hợp khác.",
    ja: "不正解 — それ以外。",
  },
  "rules.pts_exact": { en: "15 pts", vi: "15 điểm", ja: "15 pt" },
  "rules.pts_correct": { en: "5 pts", vi: "5 điểm", ja: "5 pt" },
  "rules.pts_wrong": { en: "0 pts", vi: "0 điểm", ja: "0 pt" },

  "rules.section_locking": {
    en: "Locking predictions",
    vi: "Khóa dự đoán",
    ja: "予想のロック",
  },
  "rules.locking_1": {
    en: "Edit your prediction freely until you click Lock Prediction.",
    vi: "Bạn có thể sửa dự đoán đến khi bấm Khóa dự đoán.",
    ja: "「予想をロック」を押すまで自由に編集できます。",
  },
  "rules.locking_2": {
    en: "Predictions must be locked before kick-off to count.",
    vi: "Dự đoán phải được khóa trước giờ thi đấu mới được tính.",
    ja: "予想はキックオフ前にロックする必要があります。",
  },
  "rules.locking_3": {
    en: "You can re-open and edit a locked prediction any time before kick-off.",
    vi: "Bạn có thể mở lại và sửa dự đoán bất cứ lúc nào trước trận đấu.",
    ja: "キックオフ前であればロックを解除して編集できます。",
  },

  "rules.section_ranking": {
    en: "Leaderboard",
    vi: "Bảng xếp hạng",
    ja: "ランキング",
  },
  "rules.ranking_1": {
    en: "Ranking is by total points. Ties broken by # exact scores, then # correct outcomes.",
    vi: "Xếp hạng theo tổng điểm. Cùng điểm thì xét số tỉ số chính xác, rồi đến số kết quả đúng.",
    ja: "順位は合計ポイント順。同点の場合は完全一致数、次に結果正解数で判定。",
  },
  "rules.ranking_2": {
    en: "Updated live after every match.",
    vi: "Cập nhật trực tiếp sau mỗi trận.",
    ja: "試合ごとにリアルタイムで更新されます。",
  },

  "rules.section_fairplay": {
    en: "Fair play",
    vi: "Fair play",
    ja: "フェアプレー",
  },
  "rules.fairplay_1": {
    en: "One account per employee. Use your company email.",
    vi: "Mỗi nhân viên 1 tài khoản. Dùng email công ty.",
    ja: "社員一人につき1アカウント。社用メールを使用してください。",
  },
  "rules.fairplay_2": {
    en: "Have fun and root for your team! 🏆",
    vi: "Chơi vui và cổ vũ đội mình nhé! 🏆",
    ja: "楽しんで応援しよう！🏆",
  },

  "rules.section_prizes": {
    en: "Prizes",
    vi: "Giải thưởng",
    ja: "賞品",
  },
  "rules.prizes_updating": {
    en: "Coming soon — details will be announced shortly.",
    vi: "Đang cập nhật — sẽ công bố trong thời gian tới.",
    ja: "近日公開 — 詳細は後日発表します。",
  },
};

function detectInitial() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGS.find((l) => l.code === saved)) return saved;
  } catch {}
  const nav = (navigator.language || "en").slice(0, 2).toLowerCase();
  if (nav === "vi" || nav === "ja") return nav;
  return "en";
}

const I18nContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
});

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(detectInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {}
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(code) {
    if (LANGS.find((l) => l.code === code)) setLangState(code);
  }

  function t(key, vars) {
    const entry = dict[key];
    let str = (entry && (entry[lang] || entry.en)) || key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replaceAll(`{${k}}`, String(v));
      }
    }
    return str;
  }

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  return useContext(I18nContext);
}
