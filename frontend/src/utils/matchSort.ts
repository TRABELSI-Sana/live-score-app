import type { MatchState } from "../hooks/useLiveBoard";

function parseMatchTimeValue(value?: string): number | undefined {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    let parsed = Date.parse(trimmed);
    if (Number.isNaN(parsed)) {
        const normalized = trimmed.replace(" ", "T");
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
            parsed = Date.parse(`${normalized}Z`);
        } else if (/^\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
            const now = new Date();
            const [hours, minutes, seconds] = normalized.split(":").map((part) => Number(part));
            parsed = Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                hours,
                minutes,
                Number.isFinite(seconds) ? seconds : 0
            );
        }
    }
    return Number.isNaN(parsed) ? undefined : parsed;
}

export function matchSortKey(match: { scheduled?: string; time?: string }): number {
    const scheduled = parseMatchTimeValue(match.scheduled);
    if (scheduled !== undefined) return scheduled;
    const time = (match.time ?? "").trim();
    const minuteMatch = time.match(/(\d+)(?:\+(\d+))?/);
    if (!minuteMatch) return Number.MAX_SAFE_INTEGER;
    const base = Number(minuteMatch[1]);
    const added = minuteMatch[2] ? Number(minuteMatch[2]) : 0;
    if (!Number.isFinite(base)) return Number.MAX_SAFE_INTEGER;
    return base * 100 + (Number.isFinite(added) ? added : 0);
}

export function buildCompetitionGroups(
    matches: MatchState[],
    filter: (match: MatchState) => boolean
): Array<{ comp: { id?: string; name?: string; country?: string }; matches: MatchState[] }> {
    const map = new Map<string, { comp: { id?: string; name?: string; country?: string }; matches: MatchState[] }>();

    for (const match of matches) {
        if (!filter(match)) continue;
        const comp = match.competition;
        const key = String(comp?.id ?? comp?.name ?? "Other");
        if (!map.has(key)) {
            map.set(key, {
                comp: {
                    id: comp?.id ? String(comp.id) : undefined,
                    name: comp?.name ?? "Other",
                    country: comp?.country,
                },
                matches: [],
            });
        }
        map.get(key)!.matches.push(match);
    }

    return Array.from(map.values())
        .map((group) => ({
            ...group,
            matches: group.matches.sort((a, b) => matchSortKey(a) - matchSortKey(b)),
        }))
        .sort((a, b) => {
            const aKey = a.matches[0] ? matchSortKey(a.matches[0]) : Number.MAX_SAFE_INTEGER;
            const bKey = b.matches[0] ? matchSortKey(b.matches[0]) : Number.MAX_SAFE_INTEGER;
            return aKey - bKey;
        });
}

export function formatLocalTime(value?: string): string | undefined {
    if (!value) return value;
    const trimmed = value.trim();
    let parsed = Date.parse(trimmed);
    if (Number.isNaN(parsed)) {
        const normalized = trimmed.replace(" ", "T");
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
            parsed = Date.parse(`${normalized}Z`);
        } else if (/^\d{2}:\d{2}(:\d{2})?$/.test(normalized)) {
            const now = new Date();
            const [hours, minutes, seconds] = normalized.split(":").map((part) => Number(part));
            parsed = Date.UTC(
                now.getUTCFullYear(),
                now.getUTCMonth(),
                now.getUTCDate(),
                hours,
                minutes,
                Number.isFinite(seconds) ? seconds : 0
            );
        }
    }
    if (Number.isNaN(parsed)) return value;
    return new Date(parsed).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatCompetitionLabel(comp?: { name?: string; country?: string }): string {
    const name = comp?.name?.trim() || "Championnat";
    const country = comp?.country?.trim();
    return country ? `${name} — ${country}` : name;
}

export function resolveDisplayScore(match: MatchState): string {
    const score = match.scores?.score;
    if (!score) return "0 : 0";
    const m = score.trim().match(/(\d+)\s*[-:]\s*(\d+)/);
    if (!m) return "0 : 0";
    const home = Number(m[1]);
    const away = Number(m[2]);
    if (!Number.isFinite(home) || !Number.isFinite(away)) return "0 : 0";
    return `${home} : ${away}`;
}
