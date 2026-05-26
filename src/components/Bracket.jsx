import FlagBadge from "./FlagBadge";
import { useT } from "../lib/i18n";

// Maps various stage labels (football-data, TheSportsDB) to canonical rounds.
const STAGE_MAP = {
  ROUND_OF_32: "r32",
  LAST_32: "r32",
  ROUND_OF_16: "r16",
  LAST_16: "r16",
  QUARTER_FINALS: "qf",
  SEMI_FINALS: "sf",
  THIRD_PLACE_FINAL: "tp",
  THIRD_PLACE: "tp",
  FINAL: "f",
};

const ROUND_ORDER = ["r32", "r16", "qf", "sf", "f"];

export default function Bracket({ matches, teams, onTeamClick }) {
  const { t } = useT();

  const ko = matches
    .map((m) => ({ ...m, round: STAGE_MAP[m.stage] }))
    .filter((m) => m.round && ROUND_ORDER.includes(m.round));

  const thirdPlace = matches
    .map((m) => ({ ...m, round: STAGE_MAP[m.stage] }))
    .filter((m) => m.round === "tp");

  const byRound = Object.fromEntries(ROUND_ORDER.map((r) => [r, []]));
  ko.forEach((m) => byRound[m.round].push(m));
  ROUND_ORDER.forEach((r) => {
    byRound[r].sort((a, b) => new Date(a.kickoff) - new Date(b.kickoff));
  });

  const hasAny = ROUND_ORDER.some((r) => byRound[r].length > 0);

  if (!hasAny) {
    return (
      <div className="rounded-lg border border-dashed border-arena-border p-12 text-center">
        <p className="text-arena-muted">{t("bracket.empty")}</p>
      </div>
    );
  }

  const labels = {
    r32: t("bracket.r32"),
    r16: t("bracket.r16"),
    qf: t("bracket.qf"),
    sf: t("bracket.sf"),
    f: t("bracket.f"),
  };

  return (
    <div className="space-y-8">
      <div className="overflow-x-auto pb-3">
        <div className="inline-flex gap-6 items-stretch min-w-full">
          {ROUND_ORDER.filter((r) => byRound[r].length > 0).map((round) => (
            <Column
              key={round}
              label={labels[round]}
              matches={byRound[round]}
              teams={teams}
              onTeamClick={onTeamClick}
            />
          ))}
        </div>
      </div>

      {thirdPlace.length > 0 && (
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-arena-muted mb-3">
            {t("bracket.tp")}
          </p>
          <div className="max-w-sm">
            {thirdPlace.map((m) => (
              <MatchCell
                key={m.id}
                match={m}
                teams={teams}
                onTeamClick={onTeamClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Column({ label, matches, teams, onTeamClick }) {
  return (
    <div className="flex flex-col gap-4 min-w-[240px]">
      <p className="text-[10px] tracking-[0.3em] uppercase text-arena-muted">
        {label}
      </p>
      <div className="flex flex-col gap-3 justify-around flex-1">
        {matches.map((m) => (
          <MatchCell
            key={m.id}
            match={m}
            teams={teams}
            onTeamClick={onTeamClick}
          />
        ))}
      </div>
    </div>
  );
}

function MatchCell({ match, teams, onTeamClick }) {
  const { t } = useT();
  const home = teams[match.home];
  const away = teams[match.away];
  const homeScore = match.score?.home;
  const awayScore = match.score?.away;
  const winner =
    homeScore != null && awayScore != null
      ? homeScore > awayScore
        ? "home"
        : awayScore > homeScore
        ? "away"
        : null
      : null;

  return (
    <div className="rounded-lg border border-arena-border bg-arena-surface overflow-hidden">
      <TeamRow
        team={home}
        code={match.home}
        score={homeScore}
        winner={winner === "home"}
        onClick={home && onTeamClick ? () => onTeamClick(home) : null}
        tbdLabel={t("bracket.tbd")}
      />
      <div className="h-px bg-arena-border" />
      <TeamRow
        team={away}
        code={match.away}
        score={awayScore}
        winner={winner === "away"}
        onClick={away && onTeamClick ? () => onTeamClick(away) : null}
        tbdLabel={t("bracket.tbd")}
      />
      <div className="px-3 py-1.5 bg-arena-card/40 text-[10px] font-mono text-arena-muted">
        {new Date(match.kickoff).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        })}{" "}
        ·{" "}
        {new Date(match.kickoff).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
    </div>
  );
}

function TeamRow({ team, code, score, winner, onClick, tbdLabel }) {
  const Wrapper = onClick ? "button" : "div";
  return (
    <Wrapper
      type={onClick ? "button" : undefined}
      onClick={onClick || undefined}
      className={`w-full flex items-center gap-2 px-3 py-2 text-left transition ${
        onClick ? "hover:bg-arena-card/60 cursor-pointer" : ""
      } ${winner ? "text-arena-green" : ""}`}
    >
      {team ? (
        <>
          <FlagBadge team={team} size="sm" />
          <span className="text-sm font-medium">{team.code}</span>
          <span className="text-xs text-arena-muted truncate">{team.name}</span>
        </>
      ) : (
        <>
          <span className="w-6 h-6 grid place-items-center rounded-full bg-arena-card border border-arena-border text-arena-muted text-xs">
            ?
          </span>
          <span className="text-xs text-arena-muted">{tbdLabel}</span>
        </>
      )}
      <span
        className={`ml-auto font-mono text-sm ${
          winner ? "font-semibold" : "text-arena-muted"
        }`}
      >
        {score != null ? score : "–"}
      </span>
    </Wrapper>
  );
}
