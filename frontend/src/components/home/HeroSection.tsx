import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useLiveBoard } from "../../hooks/useLiveBoard";
import { isLiveStatus, normalizeMatchStatus, UPCOMING_STATUSES } from "../../utils/matchStatus";
import { resolveDisplayScore } from "../../utils/matchSort";

export default function HeroSection() {
  const { grouped } = useLiveBoard();
  const allMatches = useMemo(() => grouped.flatMap((g) => g.list ?? []), [grouped]);
  const liveMatches = useMemo(() => allMatches.filter((m) => isLiveStatus(m.status)), [allMatches]);
  const upcomingCount = useMemo(() => allMatches.filter((m) => UPCOMING_STATUSES.has(normalizeMatchStatus(m.status))).length, [allMatches]);
  const finishedCount = useMemo(() => allMatches.filter((m) => normalizeMatchStatus(m.status) === "FINISHED").length, [allMatches]);

  const featured = liveMatches[0];

  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Scores de football en direct</h1>
        <p className="hero-subtitle">
          Suivez les matchs du jour en temps reel : scores, buteurs, cartons et classements.
          Ligue 1, Premier League, Liga, Serie A, Bundesliga et competitions internationales.
        </p>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value hero-stat-value--live">{liveMatches.length}</span>
            <span className="hero-stat-label">En direct</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">{upcomingCount}</span>
            <span className="hero-stat-label">A venir</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">{finishedCount}</span>
            <span className="hero-stat-label">Termines</span>
          </div>
        </div>
        <Link to="/en-direct" className="hero-cta">
          Voir tous les matchs →
        </Link>
      </div>

      {featured && (
        <div className="hero-featured">
          <div className="hero-featured-label">
            <span className="live-dot" /> Match en direct
          </div>
          <div className="hero-featured-teams">
            {featured.home?.name} vs {featured.away?.name}
          </div>
          <div className="hero-featured-score">{resolveDisplayScore(featured)}</div>
        </div>
      )}
    </section>
  );
}
