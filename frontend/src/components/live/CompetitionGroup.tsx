import { Fragment } from "react";
import type { MatchState } from "../../hooks/useLiveBoard";
import { formatCompetitionLabel } from "../../utils/matchSort";
import MatchCard from "./MatchCard";
import AdSlot from "../ads/AdSlot";

type Props = {
  groups: Array<{ comp: { id?: string; name?: string; country?: string }; matches: MatchState[] }>;
  onShowRanking: (ref: { id?: string; name?: string }) => void;
  onShowLineup: (ref: { id?: number; homeName?: string; awayName?: string }) => void;
};

export default function CompetitionGroup({ groups, onShowRanking, onShowLineup }: Props) {
  return (
    <>
      {groups.map((group, index) => (
        <Fragment key={group.comp.id ?? group.comp.name}>
          <div className="competition-group">
            <div className="competition-header">
              <span className="competition-name">{formatCompetitionLabel(group.comp)}</span>
              <div className="competition-actions">
                <span className="competition-count">
                  {group.matches.length} match{group.matches.length > 1 ? "s" : ""}
                </span>
                {group.comp.id && (
                  <button
                    type="button"
                    className="competition-btn"
                    onClick={() => onShowRanking({ id: String(group.comp.id), name: group.comp.name })}
                  >
                    Classement
                  </button>
                )}
              </div>
            </div>
            <div className="match-grid">
              {group.matches.map((match) => (
                <MatchCard
                  key={match.id ?? `${match.home?.name}-${match.away?.name}`}
                  match={match}
                  onShowLineup={onShowLineup}
                />
              ))}
            </div>
          </div>
          {index % 3 === 2 && (
            <AdSlot variant="in-feed" slot="8567185183" />
          )}
        </Fragment>
      ))}
    </>
  );
}
