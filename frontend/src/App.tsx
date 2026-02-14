import "./App.css";
import {useEffect, useState} from "react";
import type {MatchEvent, MatchState} from "./hooks/useLiveBoard.ts";
import {useLiveBoard} from "./hooks/useLiveBoard.ts";

const UPCOMING_STATUSES = new Set(["NOT STARTED", "SCHEDULED"]);

function normalizeMatchStatus(status?: string): string {
    if (!status) return "UNKNOWN";
    const normalized = status.trim().toUpperCase().replace(/[_-]/g, " ").replace(/\s+/g, " ");
    if (["FT", "AET", "AFTER EXTRA TIME", "PEN", "PENALTIES"].includes(normalized)) return "FINISHED";
    if (normalized === "HALF TIME") return "HALF TIME BREAK";
    return normalized;
}

function eventSide(event: MatchEvent): string {
    const side = (event.home_away ?? (event as MatchEvent & { homeAway?: string }).homeAway ?? "").toLowerCase();
    return side;
}
function normalizeEventType(value?: string): string {
    return (value ?? "").replace(/[\s_-]/g, "").toUpperCase();
}

function isGoalEvent(event?: string): boolean {
    const normalized = normalizeEventType(event);
    return normalized === "GOAL" || normalized === "GOALPENALTY" || normalized === "PENALTY" || normalized === "OWNGOAL" || normalized === "GOALP";
}

function isRedCardEvent(event?: string): boolean {
    const normalized = normalizeEventType(event);
    return normalized === "REDCARD" || normalized === "RED" || normalized === "SECONDYELLOW";
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
    const normalized = normalizeMatchStatus(status);
    if (!status) return scheduled ?? "--:--";
    if (normalized === "IN PLAY" || normalized === "ADDED TIME") return time ? `${time}'` : "EN COURS";
    if (normalized === "HALF TIME BREAK") return "MT";
    if (normalized === "FINISHED") return "TERMINÉ";
    if (UPCOMING_STATUSES.has(normalized)) return scheduled ?? "À VENIR";
    return normalized;
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

type AiInsightResponse = {
    answer?: string;
    status?: string;
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
    const [aiSummary, setAiSummary] = useState<string>("Chargement du résumé IA...");
    const [aiStatus, setAiStatus] = useState<"loading" | "idle" | "error">("loading");
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
        const status = normalizeMatchStatus(match.status);
        return status === "IN PLAY" || status === "ADDED TIME" || status === "HALF TIME BREAK";
    });
    const upcomingMatches = filteredMatches.filter((match) => UPCOMING_STATUSES.has(normalizeMatchStatus(match.status)));
    const finishedMatches = filteredMatches.filter((match) => normalizeMatchStatus(match.status) === "FINISHED");
    const sortedLiveMatches = [...liveMatches].sort((a, b) => matchSortKey(a) - matchSortKey(b));
    const liveGroups = buildCompetitionGroups(filteredMatches, (match) => {
        const status = normalizeMatchStatus(match.status);
        return status === "IN PLAY" || status === "ADDED TIME" || status === "HALF TIME BREAK";
    });
    const upcomingGroups = buildCompetitionGroups(filteredMatches, (match) => UPCOMING_STATUSES.has(normalizeMatchStatus(match.status)));
    const finishedGroups = buildCompetitionGroups(filteredMatches, (match) => normalizeMatchStatus(match.status) === "FINISHED");
    useEffect(() => {
        const prompt =
            "Fais un résumé ultra court (3 points max) des matchs en direct et des principales affiches à venir.";
        const params = new URLSearchParams({
            prompt,
            maxMatches: "12",
        });

        setAiStatus("loading");

        const stream = new EventSource(`/api/ai/insights/stream?${params.toString()}`);

        const handleInsight = (evt: MessageEvent) => {
            try {
                const data = JSON.parse(evt.data) as AiInsightResponse;
                const text = data.answer?.trim();
                if (!text) {
                    setAiSummary("Résumé IA indisponible pour le moment.");
                    setAiStatus("error");
                    return;
                }
                setAiSummary(text);
                setAiStatus(data.status === "ok" ? "idle" : "error");
            } catch {
                setAiSummary("Le résumé IA est momentanément indisponible.");
                setAiStatus("error");
            } finally {
                stream.close();
            }
        };

        const handleError = () => {
            setAiSummary("Le résumé IA est momentanément indisponible.");
            setAiStatus("error");
            stream.close();
        };

        stream.addEventListener("insight", handleInsight as EventListener);
        stream.addEventListener("error", handleError);
        stream.onerror = handleError;

        return () => {
            stream.removeEventListener("insight", handleInsight as EventListener);
            stream.removeEventListener("error", handleError);
            stream.close();
        };
    }, [grouped.length, liveMatches.length, upcomingMatches.length]);

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
        const status = normalizeMatchStatus(match.status);
        const isUpcoming = UPCOMING_STATUSES.has(status);
        const isFinished = status === "FINISHED";
        const localScheduled = formatLocalTime(match.scheduled);
        const scoreText = isUpcoming ? localScheduled ?? "--:--" : match.scores?.score ?? "0 : 0";
        const displayStatus = statusLabel(match.status, match.time, localScheduled);
        const sortedEvents = [...(match.lastEvents ?? [])].sort((a, b) => eventSortKey(a) - eventSortKey(b));
        const goalEvents = sortedEvents.filter((event) => isGoalEvent(event.event));
        const cardEvents = sortedEvents.filter((event) => isRedCardEvent(event.event));
        const homeGoals = goalEvents.filter((event) => eventSide(event).startsWith("h"));
        const awayGoals = goalEvents.filter((event) => eventSide(event).startsWith("a"));
        const homeCards = cardEvents.filter((event) => eventSide(event).startsWith("h"));
        const awayCards = cardEvents.filter((event) => eventSide(event).startsWith("a"));
        const eventSummary = goalEvents
            .map((event) => `${event.player ?? "Joueur"} ${formatEventMinute(event.time)}`)
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
                                alt={team?.name ?? "Équipe"}
                                loading="lazy"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).style.display = "none";
                                }}
                            />
                        ) : (
                            <span className="teamLogoPlaceholder"/>
                        )
                    )}
                    <span>{team?.name ?? "Équipe"}</span>
                    {side === "away" ? (
                        team?.logo ? (
                            <img
                                className="teamLogo"
                                src={team.logo}
                                alt={team?.name ?? "Équipe"}
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
                                ⚽ {event.player ?? "Joueur"} {formatEventMinute(event.time)}
                            </span>
                        ))}
                    </div>
                ) : null}
                {cards.length > 0 ? (
                    <div className={`eventList ${side === "away" ? "eventListRight" : ""}`}>
                        {cards.map((event, idx) => (
                            <span key={`red-${idx}`} className="eventBadge eventRed">
                                {formatEventIcon(event)} {event.player ?? "Joueur"} {formatEventMinute(event.time)}
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
                    {eventSummary ? <span className="matchRowSummary">Buteurs : {eventSummary}</span> : null}
                </div>
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
                        placeholder="Rechercher un club, une ligue, un match..."
                        aria-label="Recherche"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </label>
            </header>

            <main className="layout">
                <section className="centerColumn">
                    <section className="sectionBlock seoIntro" aria-labelledby="seo-intro-title">
                        <h1 id="seo-intro-title">LiveFoot — Scores de football en direct</h1>
                        <p>
                            Suivez les matchs du jour en temps réel : score, buteurs, cartons, temps additionnel et
                            état de la rencontre.
                        </p>
                        <p>
                            Nos tableaux regroupent les compétitions populaires (Ligue 1, Premier League, Bundesliga,
                            Serie A, Liga) avec un affichage lisible sur mobile et desktop.
                        </p>
                        <div className="seoChecklist">
                            <h2>Pourquoi LiveFoot ?</h2>
                            <ul>
                                <li>Mises à jour continues des scores et statuts de match.</li>
                                <li>Événements clés : buts, cartons rouges, moments décisifs.</li>
                                <li>Classements de compétition accessibles rapidement.</li>
                            </ul>
                        </div>
                        <div className="seoLinks">
                            <a href="/about.html">À propos</a>
                            <a href="/privacy.html">Politique de confidentialité</a>
                            <a href="/terms.html">Conditions</a>
                            <a href="/contact.html">Contact</a>
                        </div>
                    </section>
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
                                        <div className="competitionActions">
                                            <span className="competitionCount">
                                                {group.matches.length} match{group.matches.length > 1 ? "s" : ""}
                                            </span>
                                            {group.comp.id ? (
                                                <button
                                                    type="button"
                                                    className="competitionLink"
                                                    onClick={() =>
                                                        setRankingCompetition({
                                                            id: String(group.comp.id),
                                                            name: group.comp.name,
                                                        })
                                                    }
                                                >
                                                    Classement
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="matchGrid">
                                        {group.matches.map((match) => renderMatchCard(match, "EN COURS"))}
                                    </div>
                                </div>
                            ))
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
                                        <div className="competitionActions">
                                            <span className="competitionCount">
                                                {group.matches.length} match{group.matches.length > 1 ? "s" : ""}
                                            </span>
                                            {group.comp.id ? (
                                                <button
                                                    type="button"
                                                    className="competitionLink"
                                                    onClick={() =>
                                                        setRankingCompetition({
                                                            id: String(group.comp.id),
                                                            name: group.comp.name,
                                                        })
                                                    }
                                                >
                                                    Classement
                                                </button>
                                            ) : null}
                                        </div>
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
                                        <div className="competitionActions">
                                            <span className="competitionCount">
                                                {group.matches.length} match{group.matches.length > 1 ? "s" : ""}
                                            </span>
                                            {group.comp.id ? (
                                                <button
                                                    type="button"
                                                    className="competitionLink"
                                                    onClick={() =>
                                                        setRankingCompetition({
                                                            id: String(group.comp.id),
                                                            name: group.comp.name,
                                                        })
                                                    }
                                                >
                                                    Classement
                                                </button>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="matchGrid">
                                        {group.matches.map((match) => renderMatchCard(match, "TERMINÉ"))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
                <aside className="sideColumn">
                    <div className="sideCard">
                        <div className="sideCardHeader">
                            <h3>IA — Résumé automatique</h3>
                            <span className="sideBadge">BETA</span>
                        </div>
                        <p>
                            Nous générons un aperçu automatique des matchs clés du jour pour vous aider à repérer
                            rapidement les scores importants.
                        </p>
                        <div className="sideList">
                            <div>
                                <span className="sideLabel">Matchs en direct</span>
                                <strong>{liveMatches.length}</strong>
                            </div>
                            <div>
                                <span className="sideLabel">Matchs à venir</span>
                                <strong>{upcomingMatches.length}</strong>
                            </div>
                            <div>
                                <span className="sideLabel">Matchs terminés</span>
                                <strong>{finishedMatches.length}</strong>
                            </div>
                        </div>
                        {sortedLiveMatches[0] ? (
                            <div className="sideHighlight">
                                <span className="sideLabel">Match suivi</span>
                                <span>
                                    {sortedLiveMatches[0].home?.name ?? "Home"} —{" "}
                                    {sortedLiveMatches[0].away?.name ?? "Away"}
                                </span>
                                <strong>{sortedLiveMatches[0].scores?.score ?? "0 : 0"}</strong>
                            </div>
                        ) : null}
                        <div className="sideHighlight">
                            <span className="sideLabel">Résumé IA</span>
                            <p>{aiSummary}</p>
                            {aiStatus === "loading" ? <span className="statusText statusUpcoming">Analyse en cours…</span> : null}
                        </div>
                    </div>
                    <div className="sideCard">
                        <h3>Accès rapide</h3>
                        <p>Retrouvez les pages utiles et la documentation légale.</p>
                        <div className="sideLinks">
                            <a href="/about.html">À propos</a>
                            <a href="/contact.html">Contact</a>
                            <a href="/privacy.html">Confidentialité</a>
                            <a href="/terms.html">Conditions</a>
                        </div>
                    </div>
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
