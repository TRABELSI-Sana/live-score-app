export type LineupPlayer = {
    name: string;
    number?: string;
    grid?: string;
};

export type TeamLineup = {
    teamName: string;
    formation?: string;
    players: LineupPlayer[];
};

export type ParsedLineups = {
    home?: TeamLineup;
    away?: TeamLineup;
};

function playersFromLineup(raw: unknown): LineupPlayer[] {
    if (!Array.isArray(raw)) return [];
    return raw
        .map((entry) => {
            const player = (entry as { player?: { name?: string; number?: number | string; grid?: string } })?.player;
            const name = String(player?.name ?? "").trim();
            if (!name) return null;
            return {
                name,
                number: player?.number !== undefined ? String(player.number) : undefined,
                grid: player?.grid ? String(player.grid) : undefined,
            } as LineupPlayer;
        })
        .filter((entry): entry is LineupPlayer => entry !== null);
}

export function parseLineupsPayload(data: unknown): ParsedLineups {
    const response = (data as { response?: unknown[] })?.response;
    if (!Array.isArray(response)) return {};

    const mapped = response
        .map((item) => {
            const team = (item as { team?: { name?: string }; formation?: string; startXI?: unknown[] });
            const teamName = String(team?.team?.name ?? "").trim();
            if (!teamName) return null;
            return {
                teamName,
                formation: team.formation ? String(team.formation) : undefined,
                players: playersFromLineup(team.startXI),
            } as TeamLineup;
        })
        .filter((entry): entry is TeamLineup => entry !== null);

    return {
        home: mapped[0],
        away: mapped[1],
    };
}

function lineFromFormation(formation?: string): number[] {
    const cleaned = (formation ?? "").trim();
    if (!cleaned) return [];
    return cleaned.split("-").map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0);
}

export function splitPlayersForPitch(players: LineupPlayer[], formation?: string): LineupPlayer[][] {
    if (players.length === 0) return [];

    const playersWithGrid = players
        .map((player) => {
            const raw = (player.grid ?? "").trim();
            const match = raw.match(/^(\d+):(\d+)$/);
            if (!match) return null;
            return {
                player,
                row: Number(match[1]),
                col: Number(match[2]),
            };
        })
        .filter((entry): entry is { player: LineupPlayer; row: number; col: number } => entry !== null)
        .sort((a, b) => (a.row - b.row) || (a.col - b.col));

    if (playersWithGrid.length > 0) {
        const grouped = new Map<number, LineupPlayer[]>();
        playersWithGrid.forEach(({ player, row }) => {
            if (!grouped.has(row)) grouped.set(row, []);
            grouped.get(row)!.push(player);
        });

        const lines = Array.from(grouped.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([, linePlayers]) => linePlayers);

        const noGridPlayers = players.filter((p) => !p.grid);
        if (noGridPlayers.length > 0) lines.unshift(noGridPlayers);
        return lines;
    }

    const lines = lineFromFormation(formation);
    if (lines.length === 0) return [players];

    const out: LineupPlayer[][] = [];
    let index = 0;
    lines.forEach((size) => {
        out.push(players.slice(index, index + size));
        index += size;
    });

    if (index < players.length) {
        out.unshift(players.slice(index));
    }

    return out;
}
