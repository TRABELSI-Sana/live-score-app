import type { MatchEvent, MatchState } from "../hooks/useLiveBoard";
import { UPCOMING_STATUSES, normalizeMatchStatus, statusLabel } from "../utils/matchStatus";
import {
    eventSide, eventSortKey, formatEventIcon, formatEventMinute, formatEventPlayer,
    hasKnownPlayer, isRedCardEvent, compactGoalEvents, removeDisallowedGoals,
} from "../utils/matchEvents";
import { formatLocalTime, resolveDisplayScore } from "../utils/matchSort";

type Props = {
    match: MatchState;
    variant: string;
    onShowLineup: (ref: { id?: number; homeName?: string; awayName?: string }) => void;
};

export default function MatchCard({ match, variant, onShowLineup }: Props) {
    const status = normalizeMatchStatus(match.status);
    const isUpcoming = UPCOMING_STATUSES.has(status);
    const isFinished = status === "FINISHED";
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
    const eventSummary = namedGoalEvents
        .map((event) => `${formatEventPlayer(event)} ${formatEventMinute(event.time)}`)
        .join(" · ");

    const renderTeam = (
        side: "home" | "away",
        team: { name?: string; logo?: string } | undefined,
        goals: MatchEvent[],
        cards: MatchEvent[]
    ) => (
        <div className={`teamBlock ${side === "away" ? "teamBlockAway" : ""}`}>
            <div className={`matchRowTeam ${side === "away" ? "matchRowTeamRight" : ""}`}>
                {side === "away" ? null : (
                    team?.logo ? (
                        <img
                            className="teamLogo"
                            src={team.logo}
                            alt={team?.name ?? "Equipe"}
                            loading="lazy"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <span className="teamLogoPlaceholder"/>
                    )
                )}
                <span>{team?.name ?? "Equipe"}</span>
                {side === "away" ? (
                    team?.logo ? (
                        <img
                            className="teamLogo"
                            src={team.logo}
                            alt={team?.name ?? "Equipe"}
                            loading="lazy"
                            onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <span className="teamLogoPlaceholder"/>
                    )
                ) : null}
            </div>
            {goals.length > 0 ? (
                <div className={`eventList ${side === "away" ? "eventListRight" : ""}`}>
                    {goals.map((event, idx) => (
                        <span key={`goal-${idx}`} className="eventBadge eventGoal">
                            ⚽ {formatEventPlayer(event)} {formatEventMinute(event.time)}
                        </span>
                    ))}
                </div>
            ) : null}
            {cards.length > 0 ? (
                <div className={`eventList ${side === "away" ? "eventListRight" : ""}`}>
                    {cards.map((event, idx) => (
                        <span key={`red-${idx}`} className="eventBadge eventRed">
                            {formatEventIcon(event)} {formatEventPlayer(event)} {formatEventMinute(event.time)}
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );

    return (
        <article key={match.id ?? `${match.home?.name}-${match.away?.name}`} className="matchRowCard">
            <div className="matchRowMain">
                <div className="matchRowTime">
                    <span className="matchTime">{localScheduled ?? match.time ?? "--:--"}</span>
                    <span
                        className={`statusText ${
                            isUpcoming ? "statusUpcoming" : isFinished ? "statusFinished" : "statusLive"
                        }`}
                    >
                        {displayStatus}
                    </span>
                    <span className="matchTag">{variant}</span>
                </div>
                {renderTeam("home", match.home, homeGoals, homeCards)}
                <div className={`matchScorePill ${isUpcoming ? "matchScoreUpcoming" : ""}`}>{scoreText}</div>
                {renderTeam("away", match.away, awayGoals, awayCards)}
            </div>
            <div className="matchRowMeta">
                <span className="matchCompetition">{match.competition?.name ?? "LiveFoot"}</span>
                <button
                    type="button"
                    className="competitionLink"
                    onClick={() =>
                        onShowLineup({
                            id: match.id,
                            homeName: match.home?.name,
                            awayName: match.away?.name,
                        })
                    }
                    disabled={!match.id}
                >
                    Compos
                </button>
                {eventSummary ? <span className="matchRowSummary">Buteurs : {eventSummary}</span> : null}
            </div>
        </article>
    );
}
