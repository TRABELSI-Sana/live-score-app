import { useCallback, useMemo, useState } from "react";
import { useLiveBoardContext } from "../../hooks/useLiveBoardContext";
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
  const { grouped } = useLiveBoardContext();
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

  const { liveCount, upcomingCount, finishedCount } = useMemo(() => {
    let live = 0, upcoming = 0, finished = 0;
    for (const m of filteredMatches) {
      if (isLiveStatus(m.status)) live++;
      else if (UPCOMING_STATUSES.has(normalizeMatchStatus(m.status))) upcoming++;
      else if (normalizeMatchStatus(m.status) === "FINISHED") finished++;
    }
    return { liveCount: live, upcomingCount: upcoming, finishedCount: finished };
  }, [filteredMatches]);

  const activeGroups = useMemo(() => {
    if (activeTab === "live") return buildCompetitionGroups(filteredMatches, (m) => isLiveStatus(m.status));
    if (activeTab === "upcoming") return buildCompetitionGroups(filteredMatches, (m) => UPCOMING_STATUSES.has(normalizeMatchStatus(m.status)));
    return buildCompetitionGroups(filteredMatches, (m) => normalizeMatchStatus(m.status) === "FINISHED");
  }, [filteredMatches, activeTab]);

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
