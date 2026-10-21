export type TableRow = {
    rank?: number | string;
    position?: number | string;
    rg?: number | string;
    place?: number | string;
    group?: string;
    team?: { id?: number | string; name?: string };
    club?: { id?: number | string; name?: string };
    teamName?: string;
    name?: string;
    points?: number | string;
    pts?: number | string;
    all?: { played?: number | string; goals?: { for?: number | string; against?: number | string } };
    played?: number | string;
    matches?: number | string;
    playedGames?: number | string;
    goal_diff?: number | string;
    goalDiff?: number | string;
    goalsDiff?: number | string;
    goals?: { for?: number | string; against?: number | string };
};

export type TableDisplayRow = {
    rank: string;
    team: string;
    points: string;
    played: string;
    diff: string;
};

function toNumber(value: unknown): number | undefined {
    const parsed = typeof value === "string" && value.trim() === "" ? NaN : Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeGroupName(value: unknown): string | undefined {
    if (!value) return undefined;
    return String(value)
        .toLowerCase()
        .replace(/^(group|groupe)\s*/i, "")
        .trim();
}

function toId(value: unknown): string | undefined {
    if (value === null || value === undefined) return undefined;
    const normalized = String(value).trim();
    return normalized === "" ? undefined : normalized;
}

function groupMatchesTeams(group: Record<string, unknown>, teamIds: string[]): boolean {
    if (!Array.isArray(group?.standings)) return false;
    return (group.standings as TableRow[]).some((row) => {
        const teamId = toId(row.team?.id ?? row.club?.id);
        return teamId ? teamIds.includes(teamId) : false;
    });
}

function selectGroupStandings(
    groups: Array<Record<string, unknown>>,
    normalizedGroup?: string,
    teamIds: string[] = []
): { rows: TableRow[]; groupName?: string } {
    if (normalizedGroup) {
        const matchingGroup = groups.find(
            (entry) => normalizeGroupName(entry?.name) === normalizedGroup
        );
        const standings = matchingGroup?.standings;
        if (Array.isArray(standings)) {
            return { rows: standings as TableRow[], groupName: String(matchingGroup?.name ?? "").trim() || undefined };
        }
    }
    if (teamIds.length > 0) {
        const matchingGroup = groups.find((entry) => groupMatchesTeams(entry, teamIds));
        const standings = matchingGroup?.standings;
        if (Array.isArray(standings)) {
            return { rows: standings as TableRow[], groupName: String(matchingGroup?.name ?? "").trim() || undefined };
        }
    }
    const fallback = groups.find((entry) => Array.isArray(entry?.standings))?.standings;
    if (Array.isArray(fallback)) {
        return { rows: fallback as TableRow[] };
    }
    return { rows: [] };
}

function extractTableRows(
    data: unknown,
    groupName?: string,
    teamIds: string[] = []
): { rows: TableRow[]; groupName?: string } {
    const normalizedGroup = normalizeGroupName(groupName);
    if (Array.isArray(data)) {
        return { rows: data as TableRow[] };
    }
    const candidate = data as {
        table?: unknown;
        response?: unknown;
        standings?: unknown;
        data?: unknown;
        stages?: unknown;
    };
    if (Array.isArray(candidate?.table)) {
        return { rows: candidate.table as TableRow[] };
    }
    if (Array.isArray(candidate?.response)) {
        const response = candidate.response as Array<Record<string, unknown>>;
        const fromResponseTable = response.find((entry) => Array.isArray(entry?.table))?.table;
        if (Array.isArray(fromResponseTable)) {
            return { rows: fromResponseTable as TableRow[] };
        }
        const fromLeagueStandings = response
            .map((entry) => (entry.league as { standings?: unknown })?.standings)
            .find((standings) => Array.isArray(standings) && Array.isArray(standings[0]));
        if (Array.isArray(fromLeagueStandings) && Array.isArray(fromLeagueStandings[0])) {
            return { rows: fromLeagueStandings[0] as TableRow[] };
        }
    }
    if (Array.isArray(candidate?.stages)) {
        const stages = candidate.stages as Array<Record<string, unknown>>;
        for (const stage of stages) {
            const groups = stage.groups as Array<Record<string, unknown>> | undefined;
            if (!Array.isArray(groups)) continue;
            const selection = selectGroupStandings(groups, normalizedGroup, teamIds);
            if (selection.rows.length > 0) {
                return selection;
            }
        }
    }
    if (Array.isArray(candidate?.standings) && Array.isArray(candidate.standings[0])) {
        return { rows: candidate.standings[0] as TableRow[] };
    }
    if (candidate?.data) {
        const dataNode = candidate.data as {
            table?: unknown;
            groups?: unknown;
            stages?: unknown;
            standings?: unknown;
        };
        if (Array.isArray(dataNode?.table)) {
            return { rows: dataNode.table as TableRow[] };
        }
        if (Array.isArray(dataNode?.groups)) {
            const dataGroups = dataNode.groups as Array<Record<string, unknown>>;
            const selection = selectGroupStandings(dataGroups, normalizedGroup, teamIds);
            if (selection.rows.length > 0) {
                return selection;
            }
        }
        if (Array.isArray(dataNode?.stages)) {
            const stages = dataNode.stages as Array<Record<string, unknown>>;
            for (const stage of stages) {
                const groups = stage.groups as Array<Record<string, unknown>> | undefined;
                if (!Array.isArray(groups)) continue;
                const selection = selectGroupStandings(groups, normalizedGroup, teamIds);
                if (selection.rows.length > 0) {
                    return selection;
                }
            }
        }
        if (Array.isArray(dataNode?.standings) && Array.isArray(dataNode.standings[0])) {
            return { rows: dataNode.standings[0] as TableRow[] };
        }
    }
    return { rows: [] };
}

export function tableRowsFromData(
    data: unknown,
    groupName?: string,
    teamIds: string[] = []
): { rows: TableDisplayRow[]; groupName?: string } {
    const { rows: list, groupName: resolvedGroupName } = extractTableRows(data, groupName, teamIds);

    const rows = list.map((row, idx) => {
        const rankRaw = row.rank ?? row.position ?? row.rg ?? row.place;
        const rankNum = toNumber(rankRaw);
        const rank = rankNum !== undefined ? String(rankNum) : String(rankRaw ?? idx + 1);
        const team =
            row.team?.name ??
            row.club?.name ??
            row.teamName ??
            row.name ??
            "Equipe";
        const pointsRaw = row.points ?? row.pts;
        const pointsNum = toNumber(pointsRaw);
        const points = pointsNum !== undefined ? `${pointsNum}pts` : String(pointsRaw ?? "--");
        const playedRaw = row.played ?? row.matches ?? row.playedGames ?? row.all?.played;
        const playedNum = toNumber(playedRaw);
        const played = playedNum !== undefined ? String(playedNum) : String(playedRaw ?? "--");
        const diffRaw =
            row.goal_diff ??
            row.goalDiff ??
            row.goalsDiff ??
            (toNumber(row.goals?.for) !== undefined && toNumber(row.goals?.against) !== undefined
                ? toNumber(row.goals?.for)! - toNumber(row.goals?.against)!
                : undefined) ??
            (toNumber(row.all?.goals?.for) !== undefined && toNumber(row.all?.goals?.against) !== undefined
                ? toNumber(row.all?.goals?.for)! - toNumber(row.all?.goals?.against)!
                : undefined);
        const diffNum = toNumber(diffRaw);
        const diff = diffNum !== undefined ? `${diffNum > 0 ? "+" : ""}${diffNum}` : String(diffRaw ?? "--");

        return { rank, team, points, played, diff };
    });
    return { rows, groupName: resolvedGroupName };
}
