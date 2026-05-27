import { Link } from "react-router-dom";

export default function GameCard({ game }) {
  const { name, description, path, icon, accent = "green", disabled } = game;
  const accentClass =
    accent === "amber"
      ? "from-arena-amber/20 to-transparent border-arena-amber/30 hover:border-arena-amber/60"
      : "from-arena-green/20 to-transparent border-arena-green/30 hover:border-arena-green/60";

  const body = (
    <div
      className={`group relative overflow-hidden rounded-lg border bg-gradient-to-br ${accentClass} bg-arena-surface p-6 transition ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="text-3xl">{icon || "🎮"}</div>
        <span className="text-[10px] tracking-[0.3em] uppercase text-arena-muted">
          {disabled ? "Coming Soon" : "Play"}
        </span>
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-arena-text">
        {name}
      </h3>
      <p className="mt-2 text-sm text-arena-muted leading-relaxed line-clamp-3">
        {description}
      </p>
    </div>
  );

  if (disabled) return body;
  return <Link to={path}>{body}</Link>;
}
