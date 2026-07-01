import type { MatchEvent, MatchState } from "../../hooks/useLiveBoard";
import { UPCOMING_STATUSES, normalizeMatchStatus, statusLabel, isLiveStatus } from "../../utils/matchStatus";
import {
  eventSide, eventSortKey, formatEventIcon, formatEventMinute, formatEventPlayer,
  hasKnownPlayer, isRedCardEvent, compactGoalEvents, removeDisallowedGoals,
} from "../../utils/matchEvents";
import { formatLocalTime, resolveDisplayScore } from "../../utils/matchSort";

type Props = {
  match: MatchState;
  onShowLineup: (ref: { id?: number; homeName?: string; awayName?: string }) => void;
};

export default function MatchCard({ match, onShowLineup }: Props) {
  const status = normalizeMatchStatus(match.status);
  const isUpcoming = UPCOMING_STATUSES.has(status);
  const isFinished = status === "FINISHED";
  const isLive = isLiveStatus(match.status);
  const localScheduled = formatLocalTime(match.scheduled);
  const scoreText = isUpcoming ? localScheduled ?? "--:--" : resolveDisplayScore(match);
  const displayStatus = statusLabel(match.status, match.time, localScheduled);

  const sortedEvents = [...(match.lastEvents ?? [])].sort((a, b) => eventSortKey(a) - eventSortKey(b));
  const rawGoalEvents = removeDisallowedGoals(sortedEvents);
  const goalEvents = compactGoalEvents(rawGoalEvents);
  const namedGoalEvents = goalEvents.filter((event) => hasKnownPlayer(event));
  const cardEvents = sortedEvents.filter((event) => isRedCardEvent(event.event));
  const homeGoals = namedGoalEvents.filter((event) => eventSide(event).startsWith("h"));
  const awayGoals = namedGoalEvents.filter((event) => eventSide(event).startsWith("a"));
  const homeCards = cardEvents.filter((event) => eventSide(event).startsWith("h"));
  const awayCards = cardEvents.filter((event) => eventSide(event).startsWith("a"));

  const allEvents = [
    ...homeGoals.map((e) => ({ ...e, _type: "goal" as const })),
    ...awayGoals.map((e) => ({ ...e, _type: "goal" as const })),
    ...homeCards.map((e) => ({ ...e, _type: "red" as const })),
    ...awayCards.map((e) => ({ ...e, _type: "red" as const })),
  ];

  const scoreClass = isLive ? "match-score--live" : isUpcoming ? "match-score--upcoming" : "";
  const statusClass = isLive ? "match-status--live" : isFinished ? "match-status--finished" : "match-status--upcoming";

  return (
    <article className={`match-card${isLive ? " match-card--live" : ""}`}>
      <div className="match-card-main">
        <div className="match-team">
          {match.home?.logo ? (
            <img
              className="match-team-logo"
              src={match.home.logo}
              alt={match.home.name ?? ""}
              loading="lazy"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <span className="match-team-logo-placeholder" />
          )}
          <span className="match-team-name">{match.home?.name ?? "Equipe"}</span>
        </div>

        <div className="match-score-center">
          <span className={`match-score ${scoreClass}`}>{scoreText}</span>
          <span className={`match-status ${statusClass}`}>
            {isLive && <span className="live-dot" />}
            {displayStatus}
          </span>
        </div>

        <div className="match-team match-team--away">
          <span className="match-team-name">{match.away?.name ?? "Equipe"}</span>
          {match.away?.logo ? (
            <img
              className="match-team-logo"
              src={match.away.logo}
              alt={match.away.name ?? ""}
              loading="lazy"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <span className="match-team-logo-placeholder" />
          )}
        </div>
      </div>

      {allEvents.length > 0 && (
        <div className="match-card-events">
          {allEvents.map((event, idx) => (
            <span key={idx} className={`match-event match-event--${event._type}`}>
              {event._type === "goal" ? "⚽" : formatEventIcon(event as MatchEvent)}{" "}
              {formatEventPlayer(event as MatchEvent)} {formatEventMinute((event as MatchEvent).time)}
            </span>
          ))}
        </div>
      )}

      <div className="match-card-footer">
        <span className="match-card-competition">{match.competition?.name ?? ""}</span>
        <button
          type="button"
          className="match-card-lineup-btn"
          onClick={() => onShowLineup({ id: match.id, homeName: match.home?.name, awayName: match.away?.name })}
          disabled={!match.id}
        >
          Compos
        </button>
      </div>
    </article>
  );
}
