export default function Header({ employee, onChangeName }) {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient opacity-90" />
      <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_30%,#FFD70044,transparent_40%),radial-gradient(circle_at_80%_10%,#E1060044,transparent_40%)]" />
      <div className="relative max-w-6xl mx-auto px-6 py-10 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-wc-accent text-white grid place-items-center font-display font-extrabold text-xl shadow-card">
            ⚽
          </div>
          <div>
            <p className="uppercase tracking-[0.3em] text-wc-gold text-xs font-semibold">
              LNP Office Pool
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white leading-tight">
              FIFA World Cup 2026 — Vote your champion
            </h1>
          </div>
        </div>

        <button
          onClick={onChangeName}
          className="glass rounded-full pl-2 pr-4 py-2 flex items-center gap-3 hover:bg-white/10 transition"
        >
          <span className="w-8 h-8 rounded-full bg-wc-gold text-wc-primary font-bold grid place-items-center">
            {employee?.[0]?.toUpperCase() || "?"}
          </span>
          <span className="text-sm text-white/90">{employee || "Sign in"}</span>
        </button>
      </div>
    </header>
  );
}
