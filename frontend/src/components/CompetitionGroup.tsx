import { Fragment } from "react";
import type { MatchState } from "../hooks/useLiveBoard";
import { formatCompetitionLabel } from "../utils/matchSort";
import MatchCard from "./MatchCard";
import AdSenseUnit from "./AdSenseUnit";

type Props = {
    groups: Array<{ comp: { id?: string; name?: string; country?: string }; matches: MatchState[] }>;
    variant: string;
    showAds: boolean;
    onShowRanking: (ref: { id?: string; name?: string }) => void;
    onShowLineup: (ref: { id?: number; homeName?: string; awayName?: string }) => void;
};

export default function CompetitionGroup({ groups, variant, showAds, onShowRanking, onShowLineup }: Props) {
    return (
        <>
            {groups.map((group, index) => (
                <Fragment key={group.comp.id ?? group.comp.name}>
                    <div className="competitionBlock">
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
                                            onShowRanking({
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
                            {group.matches.map((match) => (
                                <MatchCard
                                    key={match.id ?? `${match.home?.name}-${match.away?.name}`}
                                    match={match}
                                    variant={variant}
                                    onShowLineup={onShowLineup}
                                />
                            ))}
                        </div>
                    </div>
                    {showAds && index % 2 === 1 ? (
                        <div className="adBlock inFeedAd" aria-label="Publicite">
                            <AdSenseUnit slot="8567185183" />
                        </div>
                    ) : null}
                </Fragment>
            ))}
        </>
    );
}
