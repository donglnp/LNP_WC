export default function Leaderboard({ ranked }) {
  const top = ranked.slice(0, 5);
  const max = top[0]?.votes || 1;

  return (
    <aside className="glass rounded-3xl p-6 sticky top-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-lg font-bold text-white">
          🏆 Live Leaderboard
        </h2>
        <span className="text-[10px] uppercase tracking-widest text-wc-muted">
          Top 5
        </span>
      </div>

      <ol className="space-y-3">
        {top.map((t, i) => {
          const pct = Math.round((t.votes / max) * 100);
          return (
            <li key={t.code} className="flex items-center gap-3">
              <span
                className={`w-7 h-7 grid place-items-center rounded-full text-xs font-bold ${
                  i === 0
                    ? "bg-wc-gold text-wc-primary"
                    : i === 1
                    ? "bg-white/80 text-wc-primary"
                    : i === 2
                    ? "bg-amber-700 text-white"
                    : "bg-white/10 text-white"
                }`}
              >
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-sm">
                  <span className="text-white truncate">
                    {!t.flag?.startsWith("http") && t.flag} {t.name}
                  </span>
                  <span className="text-wc-muted">{t.votes}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-wc-gold to-wc-accent"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </li>
          );
        })}
        {top.length === 0 && (
          <p className="text-sm text-wc-muted">No votes yet. Be the first!</p>
        )}
      </ol>
    </aside>
  );
}
