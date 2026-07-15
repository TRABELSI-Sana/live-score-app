import { useEffect, useState } from "react";
import { parseLineupsPayload, splitPlayersForPitch, type ParsedLineups, type TeamLineup } from "../../utils/lineups";

type LineupRef = {
  id?: number;
  homeName?: string;
  awayName?: string;
};

type Props = {
  match: LineupRef;
  onClose: () => void;
};

function PitchTeam({ team, side }: { team: TeamLineup; side: "home" | "away" }) {
  const lines = splitPlayersForPitch(team.players, team.formation);
  return (
    <div className={`lineup-team${side === "away" ? " lineup-team--away" : ""}`}>
      <div className="lineup-team-header">
        <strong>{team.teamName}</strong>
        <span>{team.formation ?? "--"}</span>
      </div>
      <div className="lineup-pitch">
        {lines.map((line, lineIdx) => (
          <div key={lineIdx} className="lineup-line">
            {line.map((player, pIdx) => (
              <div key={pIdx} className="lineup-player">
                <span className="lineup-player-number">{player.number ?? "-"}</span>
                <span className="lineup-player-name">{player.name}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LineupModal({ match, onClose }: Props) {
  const [lineups, setLineups] = useState<ParsedLineups>({});
  const [status, setStatus] = useState<"loading" | "idle" | "error">(
    () => (match.id ? "loading" : "error")
  );
  const displayStatus = match.id ? status : "error";

  useEffect(() => {
    if (!match.id) {
      return;
    }

    let cancelled = false;

    fetch(`/api/stream/matches/${match.id}/lineups`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        if (cancelled) return;
        setLineups(parseLineupsPayload(data));
        setStatus("idle");
      })
      .catch(() => {
        if (cancelled) return;
        setLineups({});
        setStatus("error");
      });

    return () => { cancelled = true; };
  }, [match.id]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-content--lg" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" aria-label="Fermer" onClick={onClose}>
          &times;
        </button>
        <div className="modal-title">
          Compositions — {match.homeName ?? "Domicile"} vs {match.awayName ?? "Exterieur"}
        </div>
        {displayStatus === "loading" && <div className="modal-status">Chargement...</div>}
        {displayStatus === "error" && (
          <div className="modal-status modal-status--error">Compositions indisponibles.</div>
        )}
        {displayStatus === "idle" && (
          <div className="lineup-grid">
            {lineups.home && <PitchTeam team={lineups.home} side="home" />}
            {lineups.away && <PitchTeam team={lineups.away} side="away" />}
            {!lineups.home && !lineups.away && (
              <div className="modal-status">Aucune composition disponible.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
