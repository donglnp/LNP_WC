export default function FlagBadge({ team, size = "md", onClick }) {
  const dims =
    size === "lg"
      ? "w-12 h-12 text-2xl sm:w-16 sm:h-16 sm:text-3xl"
      : size === "sm"
      ? "w-8 h-8 text-sm"
      : "w-12 h-12 text-2xl sm:w-16 sm:h-16 sm:text-3xl";

  const flag = team?.flag;
  const isUrl = typeof flag === "string" && /^https?:\/\//.test(flag);

  const inner = isUrl ? (
    <img
      src={flag}
      alt={team?.name || ""}
      className="w-full h-full object-contain"
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

  const baseCls = `${dims} grid place-items-center overflow-hidden`;

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
