import { useState } from "react";
import { sendMagicLink } from "../lib/auth";
import { isSupabaseReady } from "../lib/supabase";
import LanguageSwitcher from "../components/LanguageSwitcher";
import RulesModal from "../components/RulesModal";
import { useT } from "../lib/i18n";

export default function Login() {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [rulesOpen, setRulesOpen] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isSupabaseReady) {
      setError(t("login.err_supabase"));
      setStatus("error");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(t("login.err_email"));
      setStatus("error");
      return;
    }
    setStatus("sending");
    setError(null);
    try {
      await sendMagicLink(email.trim());
      setStatus("sent");
    } catch (e) {
      setError(e.message || "Failed to send magic link.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[420px_1fr]">
      <aside className="relative px-10 py-10 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-arena-green shadow-[0_0_8px_#22E27A]" />
            <span className="font-display font-semibold tracking-tight">
              LNP Arena<span className="text-arena-green">.</span>
            </span>
          </div>
          <LanguageSwitcher variant="login" />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm">
          <h1 className="font-display text-5xl font-semibold leading-[1.05] tracking-tight">
            {t("login.title_1")}
            <br />
            {t("login.title_2")}
            <br />
            <span className="text-arena-green">{t("login.title_3")}</span>
            <br />
            <span className="text-arena-green">{t("login.title_4")}</span>
          </h1>
          <p className="mt-6 text-sm text-arena-muted leading-relaxed">
            {t("login.subtitle")}{" "}
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="text-arena-green underline hover:brightness-110"
            >
              {t("rules.cta")}
            </button>
          </p>

          {status === "sent" ? (
            <div className="mt-8 rounded-md border border-arena-green/40 bg-arena-green/10 p-5">
              <p className="text-arena-green font-semibold text-sm tracking-wide">
                {t("login.sent_title")}
              </p>
              <p className="mt-2 text-sm text-arena-text/90">
                {t("login.sent_body", { email })
                  .split(email)
                  .flatMap((part, i, arr) =>
                    i < arr.length - 1
                      ? [
                          part,
                          <span key={i} className="font-mono">
                            {email}
                          </span>,
                        ]
                      : [part]
                  )}
              </p>
              <button
                onClick={() => {
                  setStatus("idle");
                  setEmail("");
                }}
                className="mt-4 text-xs text-arena-muted hover:text-arena-text underline"
              >
                {t("login.use_diff")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-3">
              <label className="block">
                <span className="text-[10px] tracking-[0.3em] uppercase text-arena-muted">
                  {t("login.email_label")}
                </span>
                <input
                  type="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("login.email_placeholder")}
                  className="mt-2 w-full rounded-md bg-arena-card border border-arena-border px-4 py-3 text-sm text-arena-text placeholder:text-arena-muted focus:outline-none focus:border-arena-green/60"
                  disabled={status === "sending"}
                />
              </label>

              <button
                type="submit"
                disabled={status === "sending"}
                className="inline-flex items-center justify-center gap-2 w-full rounded-md bg-arena-green text-arena-bg px-5 py-3 text-sm font-semibold tracking-[0.18em] uppercase hover:brightness-110 transition disabled:opacity-50"
              >
                {status === "sending" ? (
                  t("login.sending")
                ) : (
                  <>
                    <span>◈</span>
                    <span>{t("login.send")}</span>
                  </>
                )}
              </button>

              {error && (
                <p className="text-xs text-arena-red border border-arena-red/30 bg-arena-red/10 rounded px-3 py-2">
                  {error}
                </p>
              )}
              {!isSupabaseReady && (
                <p className="text-[11px] text-arena-muted">
                  {t("login.env_missing")}
                </p>
              )}
            </form>
          )}
        </div>

        <p className="text-[10px] text-arena-muted tracking-[0.3em] uppercase">
          {t("common.copyright")}
        </p>
      </aside>

      <div className="relative hidden lg:block overflow-hidden border-l border-arena-border">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://images.unsplash.com/photo-1459865264687-595d652de67e?auto=format&fit=crop&w=1800&q=70)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-arena-bg via-arena-bg/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-arena-bg/90 via-transparent to-transparent" />
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="absolute bottom-8 right-8 text-right">
          <p className="text-[10px] tracking-[0.4em] uppercase text-arena-green">
            {t("common.system_online")}
          </p>
          <p className="font-display text-5xl font-semibold text-arena-text/80">
            2026
          </p>
        </div>
      </div>

      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
    </div>
  );
}
