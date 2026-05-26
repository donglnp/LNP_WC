export default function FlagBadge({ team, size = "md", onClick }) {
  const dims =
    size === "lg"
      ? "w-12 h-12 text-2xl"
      : size === "sm"
      ? "w-6 h-6 text-xs"
      : "w-8 h-8 text-base";

  const flag = team?.flag;
  const isUrl = typeof flag === "string" && /^https?:\/\//.test(flag);

  const inner = isUrl ? (
    <img
      src={flag}
      alt={team?.name || ""}
      className="w-full h-full object-contain p-1"
      loading="lazy"
      onError={(e) => {
        e.currentTarget.replaceWith(
          Object.assign(document.createElement("span"), {
            textContent: "🏳️",
          })
        );
      }}
    />
  ) : (
    <span>{flag || "🏳️"}</span>
  );

  const baseCls = `${dims} grid place-items-center rounded-full bg-arena-card border border-arena-border overflow-hidden`;

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={team?.name}
        className={`${baseCls} hover:border-arena-green/60 transition cursor-pointer`}
      >
        {inner}
      </button>
    );
  }

  return (
    <span className={baseCls} title={team?.name}>
      {inner}
    </span>
  );
}
