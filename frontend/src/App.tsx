import "./App.css";
import {useEffect, useState} from "react";
import type {MatchEvent, MatchState} from "./hooks/useLiveBoard.ts";
import {useLiveBoard} from "./hooks/useLiveBoard.ts";

const UPCOMING_STATUSES = new Set(["NOT STARTED", "SCHEDULED"]);
function normalizeEventType(value?: string): string {
    return (value ?? "").replace(/[\s_-]/g, "").toUpperCase();
}

function isGoalEvent(event?: string): boolean {
    const normalized = normalizeEventType(event);
    return normalized === "GOAL" || normalized === "GOALPENALTY" || normalized === "PENALTY" || normalized === "OWNGOAL" || normalized === "GOALP";
}

function formatEventLabel(event?: MatchEvent): string {
    if (!event) return "Événement";
    const type = normalizeEventType(event.event);
    if (type === "GOAL" || type === "GOALPENALTY" || type === "PENALTY" || type === "GOALP") return "But";
    if (type === "OWNGOAL") return "C.S.C.";
    if (type === "YELLOWCARD" || type === "YELLOW") return "Carton jaune";
    if (type === "REDCARD" || type === "RED") return "Carton rouge";
    if (type === "SECONDYELLOW") return "Deuxième jaune";
    return event.event ? event.event.replace(/_/g, " ").toLowerCase() : "Événement";
}

function isSubstitutionEvent(event?: string): boolean {
    const normalized = normalizeEventType(event);
    return normalized === "SUBSTITUTION" || normalized === "SUB" || normalized === "SUBIN" || normalized === "SUBOUT";
}

function isYellowCardEvent(event?: string): boolean {
    const normalized = normalizeEventType(event);
    return normalized === "YELLOWCARD" || normalized === "YELLOW";
}

function formatEventIcon(event?: MatchEvent): string {
    if (!event) return "•";
    const type = normalizeEventType(event.event);
    if (type === "GOAL" || type === "GOALPENALTY" || type === "PENALTY" || type === "GOALP") return "⚽️";
    if (type === "OWNGOAL") return "🥅";
    if (type === "YELLOWCARD" || type === "YELLOW") return "🟨";
    if (type === "REDCARD" || type === "RED") return "🟥";
    if (type === "SECONDYELLOW") return "🟨🟥";
    return "•";
}

function formatEventMinute(time?: string): string {
    if (!time) return "--";
    const trimmed = time.trim();
    if (!trimmed) return "--";
    return trimmed.endsWith("'") ? trimmed : `${trimmed}'`;
}

function eventSortKey(event: MatchEvent): number {
    const time = (event.time ?? "").trim();
    const match = time.match(/(\d+)(?:\+(\d+))?/);
    if (!match) return Number.MAX_SAFE_INTEGER;
    const base = Number(match[1]);
    const added = match[2] ? Number(match[2]) : 0;
    if (!Number.isFinite(base)) return Number.MAX_SAFE_INTEGER;
    return base * 100 + (Number.isFinite(added) ? added : 0);
}

function parseMatchTimeValue(value?: string): number | undefined {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    let parsed = Date.parse(trimmed);
    if (Number.isNaN(parsed)) {
        const normalized = trimmed.replace(" ", "T");
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
            parsed = Date.parse(`${normalized}Z`);
        } else if (/^\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
            const now = new Date();
            const [hours, minutes, seconds] = normalized.split(":").map((part) => Number(part));
            parsed = Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                hours,
                minutes,
                Number.isFinite(seconds) ? seconds : 0
            );
        }
    }
    return Number.isNaN(parsed) ? undefined : parsed;
}

function matchSortKey(match: { scheduled?: string; time?: string }): number {
    const scheduled = parseMatchTimeValue(match.scheduled);
    if (scheduled !== undefined) return scheduled;
    const time = (match.time ?? "").trim();
    const minuteMatch = time.match(/(\d+)(?:\+(\d+))?/);
    if (!minuteMatch) return Number.MAX_SAFE_INTEGER;
    const base = Number(minuteMatch[1]);
    const added = minuteMatch[2] ? Number(minuteMatch[2]) : 0;
    if (!Number.isFinite(base)) return Number.MAX_SAFE_INTEGER;
    return base * 100 + (Number.isFinite(added) ? added : 0);
}

function formatCompetitionLabel(comp?: { name?: string; country?: string }): string {
    const name = comp?.name?.trim() || "Championnat";
    const country = comp?.country?.trim();
    return country ? `${name} — ${country}` : name;
}

function buildCompetitionGroups(
    matches: MatchState[],
    filter: (match: MatchState) => boolean
): Array<{ comp: { id?: string; name?: string; country?: string }; matches: MatchState[] }> {
    const map = new Map<string, { comp: { id?: string; name?: string; country?: string }; matches: MatchState[] }>();

    for (const match of matches) {
        if (!filter(match)) continue;
        const comp = match.competition;
        const key = String(comp?.id ?? comp?.name ?? "Other");
        if (!map.has(key)) {
            map.set(key, {
                comp: {
                    id: comp?.id ? String(comp.id) : undefined,
                    name: comp?.name ?? "Other",
                    country: comp?.country,
                },
                matches: [],
            });
        }
        map.get(key)!.matches.push(match);
    }

    return Array.from(map.values())
        .map((group) => ({
            ...group,
            matches: group.matches.sort((a, b) => matchSortKey(a) - matchSortKey(b)),
        }))
        .sort((a, b) => {
            const aKey = a.matches[0] ? matchSortKey(a.matches[0]) : Number.MAX_SAFE_INTEGER;
            const bKey = b.matches[0] ? matchSortKey(b.matches[0]) : Number.MAX_SAFE_INTEGER;
            return aKey - bKey;
        });
}



function statusLabel(status?: string, time?: string, scheduled?: string) {
    if (!status) return scheduled ?? "--:--";
    if (status === "IN PLAY" || status === "ADDED TIME") return time ? `${time}'` : "EN COURS";
    if (status === "HALF TIME BREAK") return "MT";
    if (status === "FINISHED") return "TERMINÉ";
    if (UPCOMING_STATUSES.has(status)) return scheduled ?? "À VENIR";
    return status;
}

function formatLocalTime(value?: string): string | undefined {
    if (!value) return value;
    const trimmed = value.trim();
    let parsed = Date.parse(trimmed);
    if (Number.isNaN(parsed)) {
        const normalized = trimmed.replace(" ", "T");
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
            parsed = Date.parse(`${normalized}Z`);
        } else if (/^\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
            const now = new Date();
            const [hours, minutes, seconds] = normalized.split(":").map((part) => Number(part));
            parsed = Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                hours,
                minutes,
                Number.isFinite(seconds) ? seconds : 0
            );
        }
    }
    if (Number.isNaN(parsed)) return value;
    return new Date(parsed).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function extractGroupName(match: {
    group?: { name?: string } | string;
    groupName?: string;
    stage?: { name?: string; group?: string };
    round?: { name?: string; group?: string };
}): string | undefined {
    const direct =
        (typeof match.group === "string" ? match.group : match.group?.name) ??
        match.groupName ??
        match.stage?.group ??
        match.round?.group;
    if (direct) return String(direct).trim();
    const roundName = match.round?.name ?? match.stage?.name;
    if (!roundName) return undefined;
    const matchGroup = roundName.match(/(?:group|groupe)\s*([a-z0-9]+)/i);
    return matchGroup ? matchGroup[1].toUpperCase() : undefined;
}

type TableRow = {
    rank?: number | string;
    position?: number | string;
    rg?: number | string;
    place?: number | string;
    group?: string;
    team?: { id?: number | string; name?: string };
    club?: { id?: number | string; name?: string };
    teamName?: string;
    name?: string;
    points?: number | string;
    pts?: number | string;
    all?: { played?: number | string; goals?: { for?: number | string; against?: number | string } };
    played?: number | string;
    matches?: number | string;
    playedGames?: number | string;
    goal_diff?: number | string;
    goalDiff?: number | string;
    goalsDiff?: number | string;
    goals?: { for?: number | string; against?: number | string };
};

type TableDisplayRow = {
    rank: string;
    team: string;
    points: string;
    played: string;
    diff: string;
};

function toNumber(value: unknown): number | undefined {
    const parsed = typeof value === "string" && value.trim() === "" ? NaN : Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeGroupName(value: unknown): string | undefined {
    if (!value) return undefined;
    return String(value)
        .toLowerCase()
        .replace(/^(group|groupe)\s*/i, "")
        .trim();
}

function toId(value: unknown): string | undefined {
    if (value === null || value === undefined) return undefined;
    const normalized = String(value).trim();
    return normalized === "" ? undefined : normalized;
}

function groupMatchesTeams(group: Record<string, unknown>, teamIds: string[]): boolean {
    if (!Array.isArray(group?.standings)) return false;
    return (group.standings as TableRow[]).some((row) => {
        const teamId = toId(row.team?.id ?? row.club?.id);
        return teamId ? teamIds.includes(teamId) : false;
    });
}

function selectGroupStandings(
    groups: Array<Record<string, unknown>>,
    normalizedGroup?: string,
    teamIds: string[] = []
): { rows: TableRow[]; groupName?: string } {
    if (normalizedGroup) {
        const matchingGroup = groups.find(
            (entry) => normalizeGroupName(entry?.name) === normalizedGroup
        );
        const standings = matchingGroup?.standings;
        if (Array.isArray(standings)) {
            return { rows: standings as TableRow[], groupName: String(matchingGroup?.name ?? "").trim() || undefined };
        }
    }
    if (teamIds.length > 0) {
        const matchingGroup = groups.find((entry) => groupMatchesTeams(entry, teamIds));
        const standings = matchingGroup?.standings;
        if (Array.isArray(standings)) {
            return { rows: standings as TableRow[], groupName: String(matchingGroup?.name ?? "").trim() || undefined };
        }
    }
    const fallback = groups.find((entry) => Array.isArray(entry?.standings))?.standings;
    if (Array.isArray(fallback)) {
        return { rows: fallback as TableRow[] };
    }
    return { rows: [] };
}

function extractTableRows(
    data: unknown,
    groupName?: string,
    teamIds: string[] = []
): { rows: TableRow[]; groupName?: string } {
    const normalizedGroup = normalizeGroupName(groupName);
    if (Array.isArray(data)) {
        return { rows: data as TableRow[] };
    }
    const candidate = data as {
        table?: unknown;
        response?: unknown;
        standings?: unknown;
        data?: unknown;
        stages?: unknown;
    };
    if (Array.isArray(candidate?.table)) {
        return { rows: candidate.table as TableRow[] };
    }
    if (Array.isArray(candidate?.response)) {
        const response = candidate.response as Array<Record<string, unknown>>;
        const fromResponseTable = response.find((entry) => Array.isArray(entry?.table))?.table;
        if (Array.isArray(fromResponseTable)) {
            return { rows: fromResponseTable as TableRow[] };
        }
        const fromLeagueStandings = response
            .map((entry) => (entry.league as { standings?: unknown })?.standings)
            .find((standings) => Array.isArray(standings) && Array.isArray(standings[0]));
        if (Array.isArray(fromLeagueStandings) && Array.isArray(fromLeagueStandings[0])) {
            return { rows: fromLeagueStandings[0] as TableRow[] };
        }
    }
    if (Array.isArray(candidate?.stages)) {
        const stages = candidate.stages as Array<Record<string, unknown>>;
        for (const stage of stages) {
            const groups = stage.groups as Array<Record<string, unknown>> | undefined;
            if (!Array.isArray(groups)) continue;
            const selection = selectGroupStandings(groups, normalizedGroup, teamIds);
            if (selection.rows.length > 0) {
                return selection;
            }
        }
    }
    if (Array.isArray(candidate?.standings) && Array.isArray(candidate.standings[0])) {
        return { rows: candidate.standings[0] as TableRow[] };
    }
    if (candidate?.data) {
        const dataNode = candidate.data as {
            table?: unknown;
            groups?: unknown;
            stages?: unknown;
            standings?: unknown;
        };
        if (Array.isArray(dataNode?.table)) {
            return { rows: dataNode.table as TableRow[] };
        }
        if (Array.isArray(dataNode?.groups)) {
            const dataGroups = dataNode.groups as Array<Record<string, unknown>>;
            const selection = selectGroupStandings(dataGroups, normalizedGroup, teamIds);
            if (selection.rows.length > 0) {
                return selection;
            }
        }
        if (Array.isArray(dataNode?.stages)) {
            const stages = dataNode.stages as Array<Record<string, unknown>>;
            for (const stage of stages) {
                const groups = stage.groups as Array<Record<string, unknown>> | undefined;
                if (!Array.isArray(groups)) continue;
                const selection = selectGroupStandings(groups, normalizedGroup, teamIds);
                if (selection.rows.length > 0) {
                    return selection;
                }
            }
        }
        if (Array.isArray(dataNode?.standings) && Array.isArray(dataNode.standings[0])) {
            return { rows: dataNode.standings[0] as TableRow[] };
        }
    }
    return { rows: [] };
}

function tableRowsFromData(
    data: unknown,
    groupName?: string,
    teamIds: string[] = []
): { rows: TableDisplayRow[]; groupName?: string } {
    const { rows: list, groupName: resolvedGroupName } = extractTableRows(data, groupName, teamIds);

    const rows = list.map((row, idx) => {
        const rankRaw = row.rank ?? row.position ?? row.rg ?? row.place;
        const rankNum = toNumber(rankRaw);
        const rank = rankNum !== undefined ? String(rankNum) : String(rankRaw ?? idx + 1);
        const team =
            row.team?.name ??
            row.club?.name ??
            row.teamName ??
            row.name ??
            "Équipe";
        const pointsRaw = row.points ?? row.pts;
        const pointsNum = toNumber(pointsRaw);
        const points = pointsNum !== undefined ? `${pointsNum}pts` : String(pointsRaw ?? "--");
        const playedRaw = row.played ?? row.matches ?? row.playedGames ?? row.all?.played;
        const playedNum = toNumber(playedRaw);
        const played = playedNum !== undefined ? String(playedNum) : String(playedRaw ?? "--");
        const diffRaw =
            row.goal_diff ??
            row.goalDiff ??
            row.goalsDiff ??
            (toNumber(row.goals?.for) !== undefined && toNumber(row.goals?.against) !== undefined
                ? toNumber(row.goals?.for)! - toNumber(row.goals?.against)!
                : undefined) ??
            (toNumber(row.all?.goals?.for) !== undefined && toNumber(row.all?.goals?.against) !== undefined
                ? toNumber(row.all?.goals?.for)! - toNumber(row.all?.goals?.against)!
                : undefined);
        const diffNum = toNumber(diffRaw);
        const diff = diffNum !== undefined ? `${diffNum > 0 ? "+" : ""}${diffNum}` : String(diffRaw ?? "--");

        return { rank, team, points, played, diff };
    });
    return { rows, groupName: resolvedGroupName };
}

export default function App() {
    const {grouped} = useLiveBoard();
    const [rankingCompetition, setRankingCompetition] = useState<{
        id?: string;
        name?: string;
        groupName?: string;
        teamIds?: string[];
    } | null>(null);
    const [rankingRows, setRankingRows] = useState<TableDisplayRow[]>([]);
    const [rankingStatus, setRankingStatus] = useState<"idle" | "loading" | "error">("idle");
    const [searchTerm, setSearchTerm] = useState("");
    const allMatches = grouped.flatMap((group) => group.list ?? []);
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch = (value: string) =>
        normalizedSearch.length === 0 || value.toLowerCase().includes(normalizedSearch);
    const filteredMatches = allMatches.filter((match) => {
        if (normalizedSearch.length === 0) return true;
        const home = match.home?.name ?? "";
        const away = match.away?.name ?? "";
        const competition = match.competition?.name ?? "";
        return [home, away, competition].some((entry) => matchesSearch(entry));
    });
    const liveMatches = filteredMatches.filter((match) => {
        const status = String(match.status ?? "").toUpperCase();
        return status === "IN PLAY" || status === "ADDED TIME" || status === "HALF TIME BREAK" || status === "HALF TIME";
    });
    const upcomingMatches = filteredMatches.filter((match) => UPCOMING_STATUSES.has(match.status ?? ""));
    const finishedMatches = filteredMatches.filter((match) => String(match.status ?? "") === "FINISHED");
    const sortedLiveMatches = [...liveMatches].sort((a, b) => matchSortKey(a) - matchSortKey(b));
    const sortedUpcomingMatches = [...upcomingMatches].sort((a, b) => matchSortKey(a) - matchSortKey(b));
    const sortedFinishedMatches = [...finishedMatches].sort((a, b) => matchSortKey(a) - matchSortKey(b));
    const liveGroups = buildCompetitionGroups(filteredMatches, (match) => {
        const status = String(match.status ?? "").toUpperCase();
        return status === "IN PLAY" || status === "ADDED TIME" || status === "HALF TIME BREAK" || status === "HALF TIME";
    });
    const upcomingGroups = buildCompetitionGroups(filteredMatches, (match) => UPCOMING_STATUSES.has(match.status ?? ""));
    const finishedGroups = buildCompetitionGroups(filteredMatches, (match) => String(match.status ?? "") === "FINISHED");
    const focusItems = [
        sortedLiveMatches[0]
            ? `${sortedLiveMatches[0].home?.name ?? "Équipe A"} - ${
                  sortedLiveMatches[0].away?.name ?? "Équipe B"
              } en direct.`
            : null,
        sortedUpcomingMatches[0]
            ? `À suivre : ${sortedUpcomingMatches[0].home?.name ?? "Équipe A"} vs ${
                  sortedUpcomingMatches[0].away?.name ?? "Équipe B"
              }.`
            : null,
        sortedFinishedMatches[0]
            ? `Dernier résultat : ${sortedFinishedMatches[0].home?.name ?? "Équipe A"} ${
                  sortedFinishedMatches[0].scores?.score ?? ""
              } ${sortedFinishedMatches[0].away?.name ?? "Équipe B"}.`
            : null,
    ].filter((item): item is string => Boolean(item));
    const competitionNames = Array.from(
        new Set(
            filteredMatches
                .map((match) => match.competition?.name)
                .filter((name): name is string => Boolean(name && name.trim()))
        )
    );
    const topCompetitions = competitionNames.slice(0, 4);
    const totalMatches = filteredMatches.length;
    const statsItems = [
        { label: "Matchs du jour", value: totalMatches },
        { label: "En cours", value: liveMatches.length },
        { label: "À venir", value: upcomingMatches.length },
        { label: "Terminés", value: finishedMatches.length },
    ];
    const livePreview = sortedLiveMatches.slice(0, 5);
    const upcomingPreview = sortedUpcomingMatches.slice(0, 5);
    const finishedPreview = sortedFinishedMatches.slice(0, 5);
    const keyMoments = filteredMatches
        .flatMap((match) =>
            (match.lastEvents ?? [])
                .filter((event) => isGoalEvent(event.event))
                .map((event) => ({
                    matchLabel: `${match.home?.name ?? "Équipe A"} - ${match.away?.name ?? "Équipe B"}`,
                    time: formatEventMinute(event.time),
                    scorer: event.player ?? "Joueur",
                    competition: match.competition?.name ?? "LiveFoot",
                }))
        )
        .sort((a, b) => (a.time > b.time ? -1 : 1))
        .slice(0, 8);

    useEffect(() => {
        if (!rankingCompetition) {
            setRankingRows([]);
            setRankingStatus("idle");
            return;
        }

        if (!rankingCompetition.id) {
            setRankingRows([]);
            setRankingStatus("error");
            return;
        }

        let cancelled = false;
        let retryTimer: ReturnType<typeof setTimeout> | null = null;
        setRankingStatus("loading");

        const loadTable = (attempt = 0) => {
            fetch(`/api/stream/competitions/${rankingCompetition.id}/table`)
                .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
                .then((data) => {
                    if (cancelled) return;
                    const { rows, groupName } = tableRowsFromData(
                        data,
                        rankingCompetition.groupName,
                        rankingCompetition.teamIds ?? []
                    );
                    if (rows.length === 0 && attempt < 2) {
                        retryTimer = setTimeout(() => loadTable(attempt + 1), 1000);
                        return;
                    }
                    setRankingRows(rows);
                    if (!rankingCompetition.groupName && groupName) {
                        setRankingCompetition((prev) => (prev ? { ...prev, groupName } : prev));
                    }
                    setRankingStatus("idle");
                })
                .catch(() => {
                    if (cancelled) return;
                    setRankingRows([]);
                    setRankingStatus("error");
                });
        };

        loadTable();

        return () => {
            cancelled = true;
            if (retryTimer) {
                clearTimeout(retryTimer);
            }
        };
    }, [rankingCompetition]);

    const renderMatchCard = (match: (typeof allMatches)[number], variant: string) => {
        const status = match.status ?? "";
        const isUpcoming = UPCOMING_STATUSES.has(status);
        const isFinished = status === "FINISHED";
        const localScheduled = formatLocalTime(match.scheduled);
        const scoreText = isUpcoming ? localScheduled ?? "--:--" : match.scores?.score ?? "0 : 0";
        const displayStatus = statusLabel(match.status, match.time, localScheduled);
        const competitionId = match.competition?.id ? String(match.competition.id) : undefined;
        const groupName = extractGroupName(match);
        const teamIds = [match.home?.id, match.away?.id]
            .map((id) => (id === null || id === undefined ? undefined : String(id)))
            .filter((id): id is string => Boolean(id));
        const sortedEvents = [...(match.lastEvents ?? [])].sort((a, b) => eventSortKey(a) - eventSortKey(b));
        const recentEvents = sortedEvents.filter(
            (event) => !isSubstitutionEvent(event.event) && !isYellowCardEvent(event.event)
        );
        const goalEvents = sortedEvents.filter((event) => isGoalEvent(event.event));
        const homeEvents = recentEvents.filter((event) => event.home_away?.toLowerCase().startsWith("h"));
        const awayEvents = recentEvents.filter((event) => event.home_away?.toLowerCase().startsWith("a"));

        return (
            <article key={match.id ?? `${match.home?.name}-${match.away?.name}`} className="matchCard">
                <div className="matchCardTop">
                    <span className="matchTime">{localScheduled ?? match.time ?? "--:--"}</span>
                    <span
                        className={`statusPill ${
                            isUpcoming ? "statusUpcoming" : isFinished ? "statusFinished" : "statusLive"
                        }`}
                    >
                        {displayStatus}
                    </span>
                </div>
                <div className="matchTeams">
                    <div className="teamBlock">
                        <div className="teamRow">
                            {match.home?.logo ? (
                                <img
                                    className="teamLogo"
                                    src={match.home.logo}
                                    alt={match.home?.name ?? "Home"}
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            ) : (
                                <span className="teamLogoPlaceholder"/>
                            )}
                            <span>{match.home?.name ?? "Home"}</span>
                        </div>
                        {homeEvents.length > 0 ? (
                            <ul className="teamEventsList">
                                {homeEvents.map((event, index) => (
                                    <li key={`${event.id ?? event.ts ?? event.time ?? index}`} className="teamEventItem">
                                        <span className="eventIcon" aria-hidden="true">
                                            {formatEventIcon(event)}
                                        </span>
                                        <span className="eventLabel">{formatEventLabel(event)}</span>
                                        <span className="eventPlayer">{event.player ?? "Joueur"}</span>
                                        <span className="eventMinute">{formatEventMinute(event.time)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                    <div className="teamBlock">
                        <div className="teamRow">
                            {match.away?.logo ? (
                                <img
                                    className="teamLogo"
                                    src={match.away.logo}
                                    alt={match.away?.name ?? "Away"}
                                    loading="lazy"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            ) : (
                                <span className="teamLogoPlaceholder"/>
                            )}
                            <span>{match.away?.name ?? "Away"}</span>
                        </div>
                        {awayEvents.length > 0 ? (
                            <ul className="teamEventsList">
                                {awayEvents.map((event, index) => (
                                    <li key={`${event.id ?? event.ts ?? event.time ?? index}`} className="teamEventItem">
                                        <span className="eventIcon" aria-hidden="true">
                                            {formatEventIcon(event)}
                                        </span>
                                        <span className="eventLabel">{formatEventLabel(event)}</span>
                                        <span className="eventPlayer">{event.player ?? "Joueur"}</span>
                                        <span className="eventMinute">{formatEventMinute(event.time)}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                </div>
                <div className={`matchScore ${isUpcoming ? "matchScoreUpcoming" : ""}`}>{scoreText}</div>
                <div className="matchEvents">
                    <div className="matchEventsHeader">
                        <span>Événements</span>
                        {goalEvents.length > 0 ? (
                            <span className="goalCount">{goalEvents.length} but{goalEvents.length > 1 ? "s" : ""}</span>
                        ) : null}
                    </div>
                    {recentEvents.length === 0 ? <div className="eventEmpty">Aucun événement signalé.</div> : null}
                    {goalEvents.length > 0 ? (
                        <div className="scorersRow">
                            <span className="scorersLabel">Buteurs :</span>
                            <span className="scorersList">
                                {goalEvents
                                    .map((event) => `${event.player ?? "Joueur"} ${formatEventMinute(event.time)}`)
                                    .join(" · ")}
                            </span>
                        </div>
                    ) : null}
                </div>
                <div className="matchMetaRow">
                    <span className="matchCompetition">{match.competition?.name ?? "LiveFoot"}</span>
                    <span className="matchTag">{variant}</span>
                </div>
                {competitionId ? (
                    <button
                        type="button"
                        className="rankingButton"
                        onClick={() =>
                            setRankingCompetition({
                                id: competitionId,
                                name: match.competition?.name,
                                groupName,
                                teamIds,
                            })
                        }
                    >
                        Voir classement
                    </button>
                ) : null}
            </article>
        );
    };

    return (
        <div className="page">
            <header className="topBar">
                <div className="brand">
                    <span className="brandIcon" aria-hidden="true">
                        LF
                    </span>
                    <span className="brandText">LiveFoot</span>
                </div>
                <label className="searchBar">
                    <span className="searchIcon">🔍</span>
                    <input
                        type="search"
                        placeholder="Search for teams, leagues, matches..."
                        aria-label="Recherche"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </label>
            </header>

            <main className="layout">
                <aside className="infoCard">
                    <h1>Scores en direct du football</h1>
                    <p>Suivi en temps réel des scores, minutes et événements des matchs du jour.</p>
                    <div className="infoStats">
                        {statsItems.map((item) => (
                            <div key={item.label} className="infoStat">
                                <span className="infoStatValue">{item.value}</span>
                                <span className="infoStatLabel">{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <div className="infoMeta">
                        <span>{competitionNames.length} compétitions suivies</span>
                        <span>Données en direct via fournisseurs officiels</span>
                    </div>
                    {topCompetitions.length > 0 ? (
                        <div className="infoHighlights">
                            <h2>Compétitions en vue</h2>
                            <div className="infoTags">
                                {topCompetitions.map((name) => (
                                    <span key={name} className="infoTag">
                                        {name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </aside>

                <section className="centerColumn">
                    <div className="sectionBlock liveSection">
                        <div className="sectionHeader">
                            <h2>Matchs en cours</h2>
                            <span>{liveMatches.length} matchs</span>
                        </div>
                        {liveGroups.length === 0 ? (
                            <div className="empty">
                                <h2>Aucun match en cours</h2>
                                <p>
                                    Revenez plus tard pour suivre les prochaines rencontres en direct. Vous pouvez déjà
                                    parcourir les matchs à venir et les compétitions à l&apos;affiche.
                                </p>
                            </div>
                        ) : (
                            liveGroups.map((group) => (
                                <div key={group.comp.id ?? group.comp.name} className="competitionBlock">
                                    <div className="competitionHeader">
                                        <span className="competitionTitle">{formatCompetitionLabel(group.comp)}</span>
                                        <span className="competitionCount">
                                            {group.matches.length} match{group.matches.length > 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    <div className="matchGrid">
                                        {group.matches.map((match) => renderMatchCard(match, "EN COURS"))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="sectionBlock momentsBlock">
                        <div className="sectionHeader">
                            <h2>Moments clés</h2>
                            <span>Derniers buts</span>
                        </div>
                        {keyMoments.length > 0 ? (
                            <ul className="momentsList">
                                {keyMoments.map((moment, index) => (
                                    <li key={`${moment.matchLabel}-${moment.time}-${index}`} className="momentItem">
                                        <span className="momentMatch">{moment.matchLabel}</span>
                                        <span className="momentDetail">
                                            {moment.scorer} · {moment.time} · {moment.competition}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="momentsEmpty">Aucun but signalé pour le moment.</p>
                        )}
                    </div>
                    <div className="sectionBlock">
                        <div className="sectionHeader">
                            <h2>Matchs à venir</h2>
                            <span>{upcomingMatches.length} matchs</span>
                        </div>
                        {upcomingGroups.length === 0 ? (
                            <div className="empty">
                                <h2>Aucun match à venir</h2>
                                <p>
                                    Les prochains matchs seront affichés ici avec leurs horaires et informations de
                                    diffusion.
                                </p>
                            </div>
                        ) : (
                            upcomingGroups.map((group) => (
                                <div key={group.comp.id ?? group.comp.name} className="competitionBlock">
                                    <div className="competitionHeader">
                                        <span className="competitionTitle">{formatCompetitionLabel(group.comp)}</span>
                                        <span className="competitionCount">
                                            {group.matches.length} match{group.matches.length > 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    <div className="matchGrid">
                                        {group.matches.map((match) => renderMatchCard(match, "À VENIR"))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="sectionBlock">
                        <div className="sectionHeader">
                            <h2>Matchs terminés</h2>
                            <span>{finishedMatches.length} matchs</span>
                        </div>
                        {finishedGroups.length === 0 ? (
                            <div className="empty">
                                <h2>Aucun match terminé</h2>
                                <p>
                                    Les résultats finaux apparaîtront ici avec les scores et les événements marquants.
                                </p>
                            </div>
                        ) : (
                            finishedGroups.map((group) => (
                                <div key={group.comp.id ?? group.comp.name} className="competitionBlock">
                                    <div className="competitionHeader">
                                        <span className="competitionTitle">{formatCompetitionLabel(group.comp)}</span>
                                        <span className="competitionCount">
                                            {group.matches.length} match{group.matches.length > 1 ? "s" : ""}
                                        </span>
                                    </div>
                                    <div className="matchGrid">
                                        {group.matches.map((match) => renderMatchCard(match, "TERMINÉ"))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="sectionBlock dashboardBlock">
                        <div className="sectionHeader">
                            <h2>Tableau rapide</h2>
                            <span>Matches clés</span>
                        </div>
                        <div className="dashboardGrid">
                            <div className="dashboardCard">
                                <h3>En direct</h3>
                                {livePreview.length > 0 ? (
                                    <ul>
                                        {livePreview.map((match) => (
                                            <li key={match.id ?? `${match.home?.name}-${match.away?.name}-live`}>
                                                <span className="dashTeams">
                                                    {match.home?.name ?? "Équipe A"} - {match.away?.name ?? "Équipe B"}
                                                </span>
                                                <span className="dashMeta">
                                                    {match.scores?.score ?? "0 : 0"} · {match.time ?? "--"}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="dashboardEmpty">Aucun match en direct.</p>
                                )}
                            </div>
                            <div className="dashboardCard">
                                <h3>À venir</h3>
                                {upcomingPreview.length > 0 ? (
                                    <ul>
                                        {upcomingPreview.map((match) => (
                                            <li key={match.id ?? `${match.home?.name}-${match.away?.name}-upcoming`}>
                                                <span className="dashTeams">
                                                    {match.home?.name ?? "Équipe A"} - {match.away?.name ?? "Équipe B"}
                                                </span>
                                                <span className="dashMeta">
                                                    {formatLocalTime(match.scheduled) ?? "--:--"} ·{" "}
                                                    {match.competition?.name ?? "LiveFoot"}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="dashboardEmpty">Aucune rencontre programmée.</p>
                                )}
                            </div>
                            <div className="dashboardCard">
                                <h3>Terminés</h3>
                                {finishedPreview.length > 0 ? (
                                    <ul>
                                        {finishedPreview.map((match) => (
                                            <li key={match.id ?? `${match.home?.name}-${match.away?.name}-done`}>
                                                <span className="dashTeams">
                                                    {match.home?.name ?? "Équipe A"} - {match.away?.name ?? "Équipe B"}
                                                </span>
                                                <span className="dashMeta">
                                                    {match.scores?.score ?? "0 : 0"} ·{" "}
                                                    {match.competition?.name ?? "LiveFoot"}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="dashboardEmpty">Aucun résultat final.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <aside className="focusCard">
                    <h3>Focus du jour</h3>
                    {focusItems.length > 0 ? (
                        <ul>
                            {focusItems.map((item, index) => (
                                <li key={`${item}-${index}`}>{item}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="focusFallback">Les moments forts apparaîtront ici dès que les matchs démarrent.</p>
                    )}
                </aside>
            </main>
            <footer className="siteFooter">
                <div className="footerLinks">
                    <a href="/about.html">À propos</a>
                    <a href="/privacy.html">Politique de confidentialité</a>
                    <a href="/terms.html">Conditions</a>
                    <a href="/contact.html">Contact</a>
                </div>
                <span className="footerNote">© 2005-2026 LiveFoot - Tous droits réservés.</span>
            </footer>
            {rankingCompetition ? (
                <div
                    className="modalBackdrop"
                    onClick={() => setRankingCompetition(null)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="rankingModal" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="modalClose"
                            aria-label="Fermer le classement"
                            onClick={() => setRankingCompetition(null)}
                        >
                            ×
                        </button>
                        <div className="rankingTitle">
                            {rankingCompetition.name
                                ? `Classement - ${rankingCompetition.name}${
                                      rankingCompetition.groupName
                                          ? ` (Groupe ${rankingCompetition.groupName})`
                                          : ""
                                  }`
                                : "Classement"}
                        </div>
                        {rankingStatus === "loading" ? (
                            <div className="rankingStatus">Chargement...</div>
                        ) : null}
                        {rankingStatus === "error" ? (
                            <div className="rankingStatus rankingError">
                                Classement indisponible pour le moment.
                            </div>
                        ) : null}
                        {rankingStatus === "idle" && rankingRows.length > 0 ? (
                            <table className="rankingTable">
                                <thead>
                                    <tr>
                                        <th>Rg</th>
                                        <th>Equipe</th>
                                        <th>Pts</th>
                                        <th>J.</th>
                                        <th>Diff</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rankingRows.map((row, idx) => (
                                        <tr key={`${row.rank}-${idx}`}>
                                            <td>{row.rank}</td>
                                            <td>{row.team}</td>
                                            <td>{row.points}</td>
                                            <td>{row.played}</td>
                                            <td>{row.diff}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : null}
                        {rankingStatus === "idle" && rankingRows.length === 0 ? (
                            <div className="rankingStatus">Aucune donnée de classement.</div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
