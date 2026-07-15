import { useEffect, useState } from "react";
import { tableRowsFromData, type TableDisplayRow } from "../../utils/tableData";

type RankingRef = {
  id?: string;
  name?: string;
  groupName?: string;
  teamIds?: string[];
};

type Props = {
  competition: RankingRef;
  onClose: () => void;
};

export default function RankingModal({ competition, onClose }: Props) {
  const [rows, setRows] = useState<TableDisplayRow[]>([]);
  const [status, setStatus] = useState<"loading" | "idle" | "error">(
    () => (competition.id ? "loading" : "error")
  );
  const [groupName, setGroupName] = useState(competition.groupName);
  const displayStatus = competition.id ? status : "error";

  useEffect(() => {
    if (!competition.id) {
      return;
    }

    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const loadTable = (attempt = 0) => {
      fetch(`/api/stream/competitions/${competition.id}/table`)
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((data) => {
          if (cancelled) return;
          const result = tableRowsFromData(data, competition.groupName, competition.teamIds ?? []);
          if (result.rows.length === 0 && attempt < 2) {
            retryTimer = setTimeout(() => loadTable(attempt + 1), 1000);
            return;
          }
          setRows(result.rows);
          if (!competition.groupName && result.groupName) setGroupName(result.groupName);
          setStatus("idle");
        })
        .catch(() => {
          if (cancelled) return;
          setRows([]);
          setStatus("error");
        });
    };

    loadTable();
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [competition]);

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content modal-content--md" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" aria-label="Fermer" onClick={onClose}>
          &times;
        </button>
        <div className="modal-title">
          {competition.name
            ? `Classement — ${competition.name}${groupName ? ` (Groupe ${groupName})` : ""}`
            : "Classement"}
        </div>
        {displayStatus === "loading" && <div className="modal-status">Chargement...</div>}
        {displayStatus === "error" && (
          <div className="modal-status modal-status--error">Classement indisponible.</div>
        )}
        {displayStatus === "idle" && rows.length > 0 && (
          <table className="ranking-table">
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
              {rows.map((row, idx) => (
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
        )}
        {displayStatus === "idle" && rows.length === 0 && (
          <div className="modal-status">Aucune donnee de classement.</div>
        )}
      </div>
    </div>
  );
}
