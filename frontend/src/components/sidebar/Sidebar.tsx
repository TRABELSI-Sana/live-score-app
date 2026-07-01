import { useMemo } from "react";
import { useLiveBoard } from "../../hooks/useLiveBoard";
import { isLiveStatus, normalizeMatchStatus, UPCOMING_STATUSES } from "../../utils/matchStatus";
import { resolveDisplayScore } from "../../utils/matchSort";
import AdSlot from "../ads/AdSlot";
import AiSummaryCard from "./AiSummaryCard";
import QuickLinksCard from "./QuickLinksCard";

export default function Sidebar() {
  const { grouped } = useLiveBoard();
  const allMatches = useMemo(() => grouped.flatMap((g) => g.list ?? []), [grouped]);
  const liveMatches = useMemo(() => allMatches.filter((m) => isLiveStatus(m.status)), [allMatches]);
  const upcomingCount = useMemo(() => allMatches.filter((m) => UPCOMING_STATUSES.has(normalizeMatchStatus(m.status))).length, [allMatches]);
  const finishedCount = useMemo(() => allMatches.filter((m) => normalizeMatchStatus(m.status) === "FINISHED").length, [allMatches]);

  const featured = liveMatches[0];

  return (
    <aside className="page-sidebar">
      <div className="sidebar-card">
        <h3 className="sidebar-card-title">Statistiques du jour</h3>
        <div className="sidebar-stats">
          <div className="sidebar-stat">
            <span className="sidebar-stat-label">En direct</span>
            <span className="sidebar-stat-value" style={{ color: "var(--color-live)" }}>
              {liveMatches.length}
            </span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-label">A venir</span>
            <span className="sidebar-stat-value">{upcomingCount}</span>
          </div>
          <div className="sidebar-stat">
            <span className="sidebar-stat-label">Termines</span>
            <span className="sidebar-stat-value">{finishedCount}</span>
          </div>
        </div>
        {featured && (
          <div className="sidebar-highlight" style={{ marginTop: 12 }}>
            <span className="sidebar-highlight-label">Match en vedette</span>
            <div className="sidebar-highlight-value">
              {featured.home?.name} — {featured.away?.name}
            </div>
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--color-live)" }}>
              {resolveDisplayScore(featured)}
            </div>
          </div>
        )}
      </div>

      <AdSlot variant="sidebar" slot="8567185183" />

      <AiSummaryCard />

      <QuickLinksCard />

      <AdSlot variant="sidebar" slot="8567185183" />
    </aside>
  );
}
