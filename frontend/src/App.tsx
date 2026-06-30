import "./App.css";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { MatchState } from "./hooks/useLiveBoard";
import { useLiveBoard } from "./hooks/useLiveBoard";
import AdSenseUnit from "./components/AdSenseUnit";
import CompetitionGroup from "./components/CompetitionGroup";
import CookieConsent from "./components/CookieConsent";
import { UPCOMING_STATUSES, normalizeMatchStatus, isLiveStatus } from "./utils/matchStatus";
import { buildCompetitionGroups, matchSortKey, resolveDisplayScore } from "./utils/matchSort";
import { tableRowsFromData, type TableDisplayRow } from "./utils/tableData";
import { parseLineupsPayload, splitPlayersForPitch, type ParsedLineups, type TeamLineup } from "./utils/lineups";

const MIN_MATCHES_FOR_ADS_SCRIPT = 6;
const MIN_COMPETITIONS_FOR_ADS_SCRIPT = 2;

function hasSufficientEditorialCoverage(matches: MatchState[]): boolean {
    const distinctCompetitions = new Set(
        matches
            .map((match) => match.competition?.id ?? match.competition?.name)
            .filter((value): value is string | number => value !== undefined && value !== null && String(value).trim() !== "")
            .map((value) => String(value))
    ).size;
    return matches.length >= MIN_MATCHES_FOR_ADS_SCRIPT && distinctCompetitions >= MIN_COMPETITIONS_FOR_ADS_SCRIPT;
}

type AiInsightResponse = {
    answer?: string;
    status?: string;
};

type LineupMatchRef = {
    id?: number;
    homeName?: string;
    awayName?: string;
};

export default function App() {
    const { grouped } = useLiveBoard();
    const [rankingCompetition, setRankingCompetition] = useState<{
        id?: string;
        name?: string;
        groupName?: string;
        teamIds?: string[];
    } | null>(null);
    const [rankingRows, setRankingRows] = useState<TableDisplayRow[]>([]);
    const [rankingStatus, setRankingStatus] = useState<"idle" | "loading" | "error">("idle");
    const [lineupMatch, setLineupMatch] = useState<LineupMatchRef | null>(null);
    const [lineups, setLineups] = useState<ParsedLineups>({});
    const [lineupStatus, setLineupStatus] = useState<"idle" | "loading" | "error">("idle");
    const [aiSummary, setAiSummary] = useState<string>("Chargement du resume IA...");
    const [aiStatus, setAiStatus] = useState<"loading" | "idle" | "error">("loading");
    const [searchTerm, setSearchTerm] = useState("");

    const allMatches = useMemo(() => grouped.flatMap((group) => group.list ?? []), [grouped]);
    const showAdsenseScript = useMemo(() => hasSufficientEditorialCoverage(allMatches), [allMatches]);

    const filteredMatches = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (normalizedSearch.length === 0) return allMatches;
        return allMatches.filter((match) => {
            const home = match.home?.name ?? "";
            const away = match.away?.name ?? "";
            const competition = match.competition?.name ?? "";
            return [home, away, competition].some((entry) => entry.toLowerCase().includes(normalizedSearch));
        });
    }, [allMatches, searchTerm]);

    const liveMatches = useMemo(
        () => filteredMatches.filter((match) => isLiveStatus(match.status)),
        [filteredMatches]
    );
    const upcomingMatches = useMemo(
        () => filteredMatches.filter((match) => UPCOMING_STATUSES.has(normalizeMatchStatus(match.status))),
        [filteredMatches]
    );
    const finishedMatches = useMemo(
        () => filteredMatches.filter((match) => normalizeMatchStatus(match.status) === "FINISHED"),
        [filteredMatches]
    );
    const sortedLiveMatches = useMemo(
        () => [...liveMatches].sort((a, b) => matchSortKey(a) - matchSortKey(b)),
        [liveMatches]
    );

    const liveGroups = useMemo(
        () => buildCompetitionGroups(filteredMatches, (m) => isLiveStatus(m.status)),
        [filteredMatches]
    );
    const upcomingGroups = useMemo(
        () => buildCompetitionGroups(filteredMatches, (m) => UPCOMING_STATUSES.has(normalizeMatchStatus(m.status))),
        [filteredMatches]
    );
    const finishedGroups = useMemo(
        () => buildCompetitionGroups(filteredMatches, (m) => normalizeMatchStatus(m.status) === "FINISHED"),
        [filteredMatches]
    );

    // AI Summary
    useEffect(() => {
        const prompt = "Fais un resume ultra court (3 points max) des matchs en direct et des principales affiches a venir.";
        const params = new URLSearchParams({ prompt, maxMatches: "12" });
        setAiStatus("loading");

        const stream = new EventSource(`/api/ai/insights/stream?${params.toString()}`);

        const handleInsight = (evt: MessageEvent) => {
            try {
                const data = JSON.parse(evt.data) as AiInsightResponse;
                const text = data.answer?.trim();
                if (!text) {
                    setAiSummary("Resume IA indisponible pour le moment.");
                    setAiStatus("error");
                    return;
                }
                setAiSummary(text);
                setAiStatus(data.status === "ok" ? "idle" : "error");
            } catch {
                setAiSummary("Le resume IA est momentanement indisponible.");
                setAiStatus("error");
            } finally {
                stream.close();
            }
        };

        const handleError = () => {
            setAiSummary("Le resume IA est momentanement indisponible.");
            setAiStatus("error");
            stream.close();
        };

        stream.addEventListener("insight", handleInsight as EventListener);
        stream.onerror = handleError;

        return () => {
            stream.removeEventListener("insight", handleInsight as EventListener);
            stream.close();
        };
    }, [grouped.length, liveMatches.length, upcomingMatches.length]);

    // Ranking table
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
            if (retryTimer) clearTimeout(retryTimer);
        };
    }, [rankingCompetition]);

    // Lineups
    useEffect(() => {
        if (!lineupMatch?.id) {
            setLineups({});
            setLineupStatus("idle");
            return;
        }

        let cancelled = false;
        setLineupStatus("loading");

        fetch(`/api/stream/matches/${lineupMatch.id}/lineups`)
            .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
            .then((data) => {
                if (cancelled) return;
                setLineups(parseLineupsPayload(data));
                setLineupStatus("idle");
            })
            .catch(() => {
                if (cancelled) return;
                setLineups({});
                setLineupStatus("error");
            });

        return () => { cancelled = true; };
    }, [lineupMatch]);

    const handleShowRanking = useCallback((ref: { id?: string; name?: string }) => {
        setRankingCompetition(ref);
    }, []);

    const handleShowLineup = useCallback((ref: { id?: number; homeName?: string; awayName?: string }) => {
        setLineupMatch(ref);
    }, []);

    const renderLineupTeam = (side: "home" | "away", team?: TeamLineup) => {
        if (!team) return null;
        const lines = splitPlayersForPitch(team.players, team.formation);
        return (
            <div className={`lineupTeam ${side === "away" ? "lineupTeamAway" : ""}`}>
                <div className="lineupTeamHeader">
                    <strong>{team.teamName}</strong>
                    <span>{team.formation ?? "Formation --"}</span>
                </div>
                <div className="pitch">
                    {lines.map((line, lineIdx) => (
                        <div key={`${team.teamName}-${lineIdx}`} className="pitchLine">
                            {line.map((player, playerIdx) => (
                                <div key={`${team.teamName}-${lineIdx}-${playerIdx}`} className="pitchPlayer">
                                    <span className="pitchNumber">{player.number ?? "-"}</span>
                                    <span className="pitchName">{player.name}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="page">
            <header className="topBar">
                <div className="brand">
                    <span className="brandIcon" aria-hidden="true">LF</span>
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
                            Suivez les matchs du jour en temps reel : score, buteurs, cartons, temps additionnel et
                            etat de la rencontre.
                        </p>
                        <p>
                            Nos tableaux regroupent les competitions populaires (Ligue 1, Premier League, Bundesliga,
                            Serie A, Liga) avec un affichage lisible sur mobile et desktop.
                        </p>
                        <div className="seoChecklist">
                            <h2>Pourquoi LiveFoot ?</h2>
                            <ul>
                                <li>Mises a jour continues des scores et statuts de match.</li>
                                <li>Evenements cles : buts, cartons rouges, moments decisifs.</li>
                                <li>Classements de competition accessibles rapidement.</li>
                            </ul>
                        </div>
                        <div className="seoLinks">
                            <a href="/about.html">A propos</a>
                            <a href="/privacy.html">Politique de confidentialite</a>
                            <a href="/terms.html">Conditions</a>
                            <a href="/contact.html">Contact</a>
                        </div>
                    </section>

                    {showAdsenseScript ? (
                        <div className="adBlock adBanner" aria-label="Publicite">
                            <AdSenseUnit slot="8567185183" />
                        </div>
                    ) : null}

                    <div className="sectionBlock liveSection">
                        <div className="sectionHeader">
                            <h2>Matchs en cours</h2>
                            <span>{liveMatches.length} matchs</span>
                        </div>
                        {liveGroups.length === 0 ? (
                            <div className="empty">
                                <h2>Aucun match en cours</h2>
                                <p>
                                    Revenez plus tard pour suivre les prochaines rencontres en direct. Vous pouvez deja
                                    parcourir les matchs a venir et les competitions a l&apos;affiche.
                                </p>
                            </div>
                        ) : (
                            <CompetitionGroup
                                groups={liveGroups}
                                variant="EN COURS"
                                showAds={showAdsenseScript}
                                onShowRanking={handleShowRanking}
                                onShowLineup={handleShowLineup}
                            />
                        )}
                    </div>

                    <div className="sectionBlock">
                        <div className="sectionHeader">
                            <h2>Matchs a venir</h2>
                            <span>{upcomingMatches.length} matchs</span>
                        </div>
                        {upcomingGroups.length === 0 ? (
                            <div className="empty">
                                <h2>Aucun match a venir</h2>
                                <p>
                                    Les prochains matchs seront affiches ici avec leurs horaires et informations de
                                    diffusion.
                                </p>
                            </div>
                        ) : (
                            <CompetitionGroup
                                groups={upcomingGroups}
                                variant="A VENIR"
                                showAds={showAdsenseScript}
                                onShowRanking={handleShowRanking}
                                onShowLineup={handleShowLineup}
                            />
                        )}
                    </div>

                    <div className="sectionBlock">
                        <div className="sectionHeader">
                            <h2>Matchs termines</h2>
                            <span>{finishedMatches.length} matchs</span>
                        </div>
                        {finishedGroups.length === 0 ? (
                            <div className="empty">
                                <h2>Aucun match termine</h2>
                                <p>
                                    Les resultats finaux apparaitront ici avec les scores et les evenements marquants.
                                </p>
                            </div>
                        ) : (
                            <CompetitionGroup
                                groups={finishedGroups}
                                variant="TERMINE"
                                showAds={showAdsenseScript}
                                onShowRanking={handleShowRanking}
                                onShowLineup={handleShowLineup}
                            />
                        )}
                    </div>
                </section>

                <aside className="sideColumn">
                    <div className="sideCard">
                        <div className="sideCardHeader">
                            <h3>IA — Resume automatique</h3>
                            <span className="sideBadge">BETA</span>
                        </div>
                        <p>
                            Nous generons un apercu automatique des matchs cles du jour pour vous aider a reperer
                            rapidement les scores importants.
                        </p>
                        <div className="sideList">
                            <div>
                                <span className="sideLabel">Matchs en direct</span>
                                <strong>{liveMatches.length}</strong>
                            </div>
                            <div>
                                <span className="sideLabel">Matchs a venir</span>
                                <strong>{upcomingMatches.length}</strong>
                            </div>
                            <div>
                                <span className="sideLabel">Matchs termines</span>
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
                                <strong>{resolveDisplayScore(sortedLiveMatches[0])}</strong>
                            </div>
                        ) : null}
                        <div className="sideHighlight">
                            <span className="sideLabel">Resume IA</span>
                            <p>{aiSummary}</p>
                            {aiStatus === "loading" ? <span className="statusText statusUpcoming">Analyse en cours…</span> : null}
                        </div>
                    </div>

                    {showAdsenseScript ? (
                        <div className="sideCard adSideCard" aria-label="Publicite">
                            <AdSenseUnit slot="8567185183" />
                        </div>
                    ) : null}

                    <div className="sideCard">
                        <h3>Acces rapide</h3>
                        <p>Retrouvez les pages utiles et la documentation legale.</p>
                        <div className="sideLinks">
                            <a href="/guides">Guides</a>
                            <a href="/news">Articles</a>
                            <a href="/teams">Equipes</a>
                            <a href="/competitions">Competitions</a>
                            <a href="/about.html">A propos</a>
                            <a href="/contact.html">Contact</a>
                            <a href="/privacy.html">Confidentialite</a>
                            <a href="/terms.html">Conditions</a>
                        </div>
                    </div>

                    <div className="sideCard">
                        <h3>Analyse editoriale</h3>
                        <p>
                            Notre redaction agrege les scores en direct, les statuts de matchs, les affiches a venir
                            et les classements pour offrir une lecture rapide mais utile de la journee football.
                        </p>
                        <ul className="editorialList">
                            <li>Suivi minute par minute des matchs en cours.</li>
                            <li>Vue par competition pour comparer les affiches du jour.</li>
                            <li>Acces rapide aux classements et compositions des disponibilite.</li>
                        </ul>
                    </div>
                </aside>
            </main>

            <footer className="siteFooter">
                <div className="footerLinks">
                    <a href="/guides">Guides</a>
                    <a href="/news">Articles</a>
                    <a href="/teams">Equipes</a>
                    <a href="/competitions">Competitions</a>
                    <a href="/about.html">A propos</a>
                    <a href="/privacy.html">Politique de confidentialite</a>
                    <a href="/terms.html">Conditions</a>
                    <a href="/contact.html">Contact</a>
                </div>
                <span className="footerNote">&copy; 2005-2026 LiveFoot - Tous droits reserves.</span>
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
                            &times;
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
                        {rankingStatus === "loading" ? <div className="rankingStatus">Chargement...</div> : null}
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
                            <div className="rankingStatus">Aucune donnee de classement.</div>
                        ) : null}
                    </div>
                </div>
            ) : null}

            {lineupMatch ? (
                <div
                    className="modalBackdrop"
                    onClick={() => setLineupMatch(null)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="rankingModal lineupModal" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="modalClose"
                            aria-label="Fermer les compositions"
                            onClick={() => setLineupMatch(null)}
                        >
                            &times;
                        </button>
                        <div className="rankingTitle">
                            Compositions - {lineupMatch.homeName ?? "Home"} vs {lineupMatch.awayName ?? "Away"}
                        </div>
                        {lineupStatus === "loading" ? <div className="rankingStatus">Chargement...</div> : null}
                        {lineupStatus === "error" ? (
                            <div className="rankingStatus rankingError">Compositions indisponibles.</div>
                        ) : null}
                        {lineupStatus === "idle" ? (
                            <div className="lineupGrid">
                                {renderLineupTeam("home", lineups.home)}
                                {renderLineupTeam("away", lineups.away)}
                                {!lineups.home && !lineups.away ? (
                                    <div className="rankingStatus">Aucune composition disponible pour ce match.</div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}

            <CookieConsent />
        </div>
    );
}
