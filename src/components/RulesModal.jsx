import { useEffect } from "react";
import { useT } from "../lib/i18n";

export default function RulesModal({ onClose }) {
  const { t } = useT();

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div className="min-h-full grid place-items-center p-4">
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl rounded-xl border border-arena-border bg-arena-surface shadow-card"
        >
          <header className="flex items-center gap-4 p-6 border-b border-arena-border">
            <span className="w-10 h-10 grid place-items-center rounded-lg bg-arena-green/15 text-arena-green text-xl">
              ◈
            </span>
            <h2 className="font-display text-xl font-semibold flex-1">
              {t("rules.title")}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 grid place-items-center rounded-md border border-arena-border text-arena-muted hover:text-arena-text hover:border-arena-green/40"
              aria-label="Close"
            >
              ✕
            </button>
          </header>

          <div className="p-6 space-y-8">
            <Section title={t("rules.section_scoring")}>
              <ScoringRow
                points={t("rules.pts_exact")}
                text={t("rules.scoring_exact")}
                tone="green"
              />
              <ScoringRow
                points={t("rules.pts_correct")}
                text={t("rules.scoring_correct")}
                tone="amber"
              />
              <ScoringRow
                points={t("rules.pts_wrong")}
                text={t("rules.scoring_wrong")}
                tone="muted"
              />
            </Section>

            <Section title={t("rules.section_locking")}>
              <BulletList
                items={[
                  t("rules.locking_1"),
                  t("rules.locking_2"),
                  t("rules.locking_3"),
                ]}
              />
            </Section>

            <Section title={t("rules.section_ranking")}>
              <BulletList
                items={[t("rules.ranking_1"), t("rules.ranking_2")]}
              />
            </Section>

            <Section title={t("rules.section_fairplay")}>
              <BulletList
                items={[t("rules.fairplay_1"), t("rules.fairplay_2")]}
              />
            </Section>

            <Section title={t("rules.section_prizes")}>
              <div className="rounded-md border border-dashed border-arena-amber/40 bg-arena-amber/5 px-4 py-3 flex items-center gap-3">
                <span className="text-arena-amber text-lg">🏆</span>
                <div className="flex-1">
                  <p className="text-sm text-arena-text/90">
                    {t("rules.prizes_updating")}
                  </p>
                </div>
                <span className="text-[10px] tracking-[0.25em] uppercase text-arena-amber border border-arena-amber/40 rounded px-2 py-1">
                  TBD
                </span>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] tracking-[0.3em] uppercase text-arena-green">
          ◆ {title}
        </span>
        <span className="h-px flex-1 bg-arena-border" />
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ScoringRow({ points, text, tone }) {
  const cls =
    tone === "green"
      ? "text-arena-green border-arena-green/40"
      : tone === "amber"
      ? "text-arena-amber border-arena-amber/40"
      : "text-arena-muted border-arena-border";
  return (
    <div className="flex items-start gap-3">
      <span
        className={`shrink-0 font-mono text-xs px-2 py-1 rounded border ${cls}`}
      >
        {points}
      </span>
      <p className="text-sm text-arena-text/90 leading-relaxed">{text}</p>
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((it, i) => (
        <li
          key={i}
          className="flex items-start gap-3 text-sm text-arena-text/90 leading-relaxed"
        >
          <span className="text-arena-green mt-1">›</span>
          <span>{it}</span>
        </li>
      ))}
    </ul>
  );
}
