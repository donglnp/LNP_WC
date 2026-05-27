export default function TeamCard({ team, votes, total, selected, onVote }) {
  const pct = total ? Math.round((votes / total) * 100) : 0;
  const isFlagUrl = team.flag?.startsWith("http");

  return (
    <div
      className={`relative rounded-2xl p-5 transition-all border ${
        selected
          ? "bg-wc-accent/15 border-wc-accent shadow-glow"
          : "glass border-white/5 hover:border-white/20"
      }`}
    >
      <div className="flex items-center gap-3">
        {isFlagUrl ? (
          <img
            src={team.flag}
            alt=""
            className="w-12 h-12 rounded-full object-cover bg-white/10"
          />
        ) : (
          <span className="text-3xl leading-none">{team.flag || "🏳️"}</span>
        )}
        <div className="min-w-0">
          <p className="font-display font-bold text-white truncate">
            {team.name}
          </p>
          <p className="text-xs text-wc-muted">
            {team.code} {team.group && `· Group ${team.group}`}
          </p>
        </div>
        <span className="ml-auto text-right">
          <span className="block text-xl font-extrabold text-white">
            {votes}
          </span>
          <span className="block text-[10px] uppercase tracking-widest text-wc-muted">
            votes
          </span>
        </span>
      </div>

      <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-wc-gold to-wc-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-wc-muted">{pct}% support</span>
        <button
          onClick={() => onVote(team)}
          className={`text-sm font-semibold px-4 py-1.5 rounded-full transition ${
            selected
              ? "bg-wc-gold text-wc-primary"
              : "bg-white/10 text-white hover:bg-wc-accent"
          }`}
        >
          {selected ? "Your pick ✓" : "Vote"}
        </button>
      </div>
    </div>
  );
}
