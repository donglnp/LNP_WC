import { useEffect, useRef, useState } from "react";
import { LANGS, useT } from "../lib/i18n";

export default function LanguageSwitcher({ variant = "nav" }) {
  const { lang, setLang } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = LANGS.find((l) => l.code === lang) || LANGS[0];

  useEffect(() => {
    function onDoc(e) {
      if (!ref.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const triggerCls =
    variant === "login"
      ? "text-xs text-arena-muted border border-arena-border rounded-md px-2 py-1 inline-flex items-center gap-1 hover:text-arena-text"
      : "text-xs text-arena-muted hover:text-arena-text inline-flex items-center gap-1";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={triggerCls}
      >
        <span>🌐</span>
        <span>{variant === "login" ? current.label.toUpperCase() : current.short}</span>
        <span className="opacity-50">▾</span>
      </button>
      {open && (
        <ul className="absolute right-0 mt-2 w-40 rounded-md border border-arena-border bg-arena-surface shadow-card z-50 overflow-hidden">
          {LANGS.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-arena-card transition ${
                  l.code === lang ? "text-arena-green" : "text-arena-text"
                }`}
              >
                <span>{l.flag}</span>
                <span className="flex-1">{l.label}</span>
                {l.code === lang && (
                  <span className="text-arena-green text-xs">●</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
