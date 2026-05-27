import { useState } from "react";
import { signInWithGoogle, isSupabaseReady } from "../lib/auth";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useT } from "../lib/i18n";

export default function Login() {
  const { t } = useT();
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function handleGoogleSignIn() {
    if (!isSupabaseReady) {
      setError(t("login.err_supabase"));
      setStatus("error");
      return;
    }
    setStatus("signing");
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e.message || "Failed to sign in with Google.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[460px_1fr]">
      <aside className="relative px-6 py-8 sm:px-10 sm:py-10 flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-arena-green shadow-[0_0_8px_#22E27A]" />
            <span className="font-display font-semibold tracking-tight">
              LNP Hub<span className="text-arena-green">.</span>
            </span>
          </div>
          <LanguageSwitcher variant="login" />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm">
          <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.05] tracking-tight">
            {t("login.headline_1")}
            <br />
            <span>{t("login.headline_2")}</span>{" "}
            <span className="text-arena-green">{t("login.headline_3")}</span>
          </h1>
          <p className="mt-6 text-sm text-arena-muted leading-relaxed">
            {t("login.tagline")}
          </p>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={status === "signing" || !isSupabaseReady}
              className="inline-flex items-center justify-center gap-3 w-full rounded-md bg-arena-text text-arena-bg px-5 py-3 text-sm font-semibold tracking-[0.18em] uppercase hover:brightness-110 transition disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.11A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.11V7.05H2.18A11 11 0 0 0 1 12c0 1.78.43 3.46 1.18 4.95l3.66-2.84Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
                />
              </svg>
              <span>
                {status === "signing"
                  ? t("login.signing")
                  : t("login.continue_google")}
              </span>
            </button>

            <p className="text-xs text-arena-muted">
              {t("login.subtitle")}
            </p>

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
          </div>
        </div>

        <p className="text-[10px] text-arena-muted tracking-[0.3em] uppercase">
          {t("common.copyright")}
        </p>
      </aside>

      <div className="relative hidden lg:block overflow-hidden border-l border-arena-border bg-arena-bg">
        <div className="absolute inset-0 bg-gradient-to-br from-arena-green/10 via-arena-bg to-arena-bg" />
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 70% 30%, rgba(34, 226, 122, 0.15), transparent 50%), radial-gradient(circle at 30% 70%, rgba(34, 226, 122, 0.08), transparent 50%)",
          }}
        />
        <div className="absolute bottom-8 right-8 text-right">
          <p className="text-[10px] tracking-[0.4em] uppercase text-arena-green">
            {t("common.system_online")}
          </p>
          <p className="font-display text-5xl font-semibold text-arena-text/80 tracking-tight">
            HUB
          </p>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="grid grid-cols-3 gap-3 opacity-60">
            {["⚽", "💪", "🧩", "🎯", "🏆", "🎲"].map((icon, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-lg border border-arena-border bg-arena-surface/60 grid place-items-center text-2xl"
              >
                {icon}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
