import "./App.css";
import {useEffect, useState} from "react";
import {useLiveBoard} from "./hooks/useLiveBoard";

const UPCOMING_STATUSES = new Set(["NOT STARTED", "SCHEDULED"]);

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
        return status === "IN PLAY" || status === "ADDED TIME";
    });
    const upcomingMatches = filteredMatches.filter((match) => UPCOMING_STATUSES.has(match.status ?? ""));
    const finishedMatches = filteredMatches.filter((match) => String(match.status ?? "") === "FINISHED");
    const focusItems = [
        liveMatches[0]
            ? `${liveMatches[0].home?.name ?? "Équipe A"} - ${liveMatches[0].away?.name ?? "Équipe B"} en direct.`
            : null,
        upcomingMatches[0]
            ? `À suivre : ${upcomingMatches[0].home?.name ?? "Équipe A"} vs ${
                  upcomingMatches[0].away?.name ?? "Équipe B"
              }.`
            : null,
        finishedMatches[0]
            ? `Dernier résultat : ${finishedMatches[0].home?.name ?? "Équipe A"} ${
                  finishedMatches[0].scores?.score ?? ""
              } ${finishedMatches[0].away?.name ?? "Équipe B"}.`
            : null,
    ].filter((item): item is string => Boolean(item));

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
                </div>
                <div className={`matchScore ${isUpcoming ? "matchScoreUpcoming" : ""}`}>{scoreText}</div>
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
                    <h1>Les matchs du jour – Scores et résultats en temps réel</h1>
                    <p>
                        Retrouvez ici tous les matchs de football joués aujourd&apos;hui, avec les scores mis à
                        jour en direct, les buteurs, les cartons et les statuts des rencontres.
                    </p>
                    <p>
                        Les compétitions sont classées par ligue pour une lecture simple et rapide. Aujourd&apos;hui,
                        la Premier League, la Bundesliga et les compétitions africaines sont à l&apos;honneur.
                    </p>
                    <button type="button" className="contactButton">
                        Contact
                    </button>
                </aside>

                <section className="centerColumn">
                    <div className="sectionBlock">
                        <div className="sectionHeader">
                            <h2>Matchs en cours</h2>
                            <span>{liveMatches.length} matchs</span>
                        </div>
                        <div className="matchGrid">
                            {liveMatches.length === 0 ? (
                                <div className="empty">
                                    <h2>Aucun match en cours</h2>
                                    <p>Revenez plus tard pour suivre les prochaines rencontres en direct.</p>
                                </div>
                            ) : (
                                liveMatches.map((match) => renderMatchCard(match, "EN COURS"))
                            )}
                        </div>
                    </div>
                    <div className="sectionBlock">
                        <div className="sectionHeader">
                            <h2>Matchs à venir</h2>
                            <span>{upcomingMatches.length} matchs</span>
                        </div>
                        <div className="matchGrid">
                            {upcomingMatches.length === 0 ? (
                                <div className="empty">
                                    <h2>Aucun match à venir</h2>
                                    <p>Les prochains matchs seront affichés ici.</p>
                                </div>
                            ) : (
                                upcomingMatches.map((match) => renderMatchCard(match, "À VENIR"))
                            )}
                        </div>
                    </div>
                    <div className="sectionBlock">
                        <div className="sectionHeader">
                            <h2>Matchs terminés</h2>
                            <span>{finishedMatches.length} matchs</span>
                        </div>
                        <div className="matchGrid">
                            {finishedMatches.length === 0 ? (
                                <div className="empty">
                                    <h2>Aucun match terminé</h2>
                                    <p>Les résultats finaux apparaîtront ici.</p>
                                </div>
                            ) : (
                                finishedMatches.map((match) => renderMatchCard(match, "TERMINÉ"))
                            )}
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
