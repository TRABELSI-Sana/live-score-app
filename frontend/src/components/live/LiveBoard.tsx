import { useCallback, useMemo, useState } from "react";
import { useLiveBoard } from "../../hooks/useLiveBoard";
import { UPCOMING_STATUSES, normalizeMatchStatus, isLiveStatus } from "../../utils/matchStatus";
import { buildCompetitionGroups } from "../../utils/matchSort";
import CompetitionGroup from "./CompetitionGroup";
import RankingModal from "./RankingModal";
import LineupModal from "./LineupModal";

type Tab = "live" | "upcoming" | "finished";

type Props = {
  searchTerm?: string;
  maxGroups?: number;
};

export default function LiveBoard({ searchTerm = "", maxGroups }: Props) {
  const { grouped } = useLiveBoard();
  const [activeTab, setActiveTab] = useState<Tab>("live");
  const [rankingRef, setRankingRef] = useState<{ id?: string; name?: string } | null>(null);
  const [lineupRef, setLineupRef] = useState<{ id?: number; homeName?: string; awayName?: string } | null>(null);

  const allMatches = useMemo(() => grouped.flatMap((g) => g.list ?? []), [grouped]);

  const filteredMatches = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allMatches;
    return allMatches.filter((m) =>
      [m.home?.name, m.away?.name, m.competition?.name]
        .some((s) => s?.toLowerCase().includes(q))
    );
  }, [allMatches, searchTerm]);

  const liveCount = useMemo(() => filteredMatches.filter((m) => isLiveStatus(m.status)).length, [filteredMatches]);
  const upcomingCount = useMemo(() => filteredMatches.filter((m) => UPCOMING_STATUSES.has(normalizeMatchStatus(m.status))).length, [filteredMatches]);
  const finishedCount = useMemo(() => filteredMatches.filter((m) => normalizeMatchStatus(m.status) === "FINISHED").length, [filteredMatches]);

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

  const activeGroups = activeTab === "live" ? liveGroups : activeTab === "upcoming" ? upcomingGroups : finishedGroups;
  const displayGroups = maxGroups ? activeGroups.slice(0, maxGroups) : activeGroups;

  const handleShowRanking = useCallback((ref: { id?: string; name?: string }) => {
    setRankingRef(ref);
  }, []);

  const handleShowLineup = useCallback((ref: { id?: number; homeName?: string; awayName?: string }) => {
    setLineupRef(ref);
  }, []);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "live", label: "En cours", count: liveCount },
    { key: "upcoming", label: "A venir", count: upcomingCount },
    { key: "finished", label: "Termines", count: finishedCount },
  ];

  return (
    <div>
      <div className="liveboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`liveboard-tab${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.key === "live" && <span className="live-dot" />}
            {tab.label}
            <span className="liveboard-tab-badge">{tab.count}</span>
          </button>
        ))}
      </div>

      {displayGroups.length === 0 ? (
        <div className="liveboard-empty">
          <h3>
            {activeTab === "live" && "Aucun match en cours"}
            {activeTab === "upcoming" && "Aucun match a venir"}
            {activeTab === "finished" && "Aucun match termine"}
          </h3>
          <p>Les matchs apparaitront ici des qu'ils seront disponibles.</p>
        </div>
      ) : (
        <CompetitionGroup
          groups={displayGroups}
          onShowRanking={handleShowRanking}
          onShowLineup={handleShowLineup}
        />
      )}

      {rankingRef && <RankingModal competition={rankingRef} onClose={() => setRankingRef(null)} />}
      {lineupRef && <LineupModal match={lineupRef} onClose={() => setLineupRef(null)} />}
    </div>
  );
}
