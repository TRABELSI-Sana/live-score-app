import type { MatchEvent } from "../hooks/useLiveBoard";

export function eventSide(event: MatchEvent): string {
    return (event.home_away ?? event.homeAway ?? "").toLowerCase();
}

export function normalizeEventType(value?: string): string {
    return (value ?? "").replace(/[\s_-]/g, "").toUpperCase();
}

export function isGoalEvent(event?: string): boolean {
    const normalized = normalizeEventType(event);
    return normalized === "GOAL" || normalized === "NORMALGOAL" || normalized === "GOALPENALTY" || normalized === "PENALTY" || normalized === "OWNGOAL" || normalized === "GOALP";
}

export function isGoalDisallowedEvent(event?: string): boolean {
    const normalized = normalizeEventType(event);
    return normalized.includes("GOALDISALLOWED") || normalized.includes("DISALLOWEDGOAL");
}

export function isRedCardEvent(event?: string): boolean {
    const normalized = normalizeEventType(event);
    return normalized === "REDCARD" || normalized === "RED" || normalized === "SECONDYELLOW";
}

export function formatEventIcon(event?: MatchEvent): string {
    if (!event) return "•";
    const type = normalizeEventType(event.event);
    if (type === "GOAL" || type === "NORMALGOAL" || type === "GOALPENALTY" || type === "PENALTY" || type === "GOALP") return "⚽️";
    if (type === "OWNGOAL") return "🥅";
    if (type === "YELLOWCARD" || type === "YELLOW") return "🟨";
    if (type === "REDCARD" || type === "RED") return "🟥";
    if (type === "SECONDYELLOW") return "🟨🟥";
    return "•";
}

export function formatEventMinute(time?: string): string {
    if (!time) return "--";
    const trimmed = time.trim();
    if (!trimmed) return "--";
    return trimmed.endsWith("'") ? trimmed : `${trimmed}'`;
}

export function eventSortKey(event: MatchEvent): number {
    const time = (event.time ?? "").trim();
    const match = time.match(/(\d+)(?:\+(\d+))?/);
    if (!match) return Number.MAX_SAFE_INTEGER;
    const base = Number(match[1]);
    const added = match[2] ? Number(match[2]) : 0;
    if (!Number.isFinite(base)) return Number.MAX_SAFE_INTEGER;
    return base * 100 + (Number.isFinite(added) ? added : 0);
}

function isMinutePlaceholderName(value?: string): boolean {
    const raw = (value ?? "").trim().replace(/'/g, "");
    if (!raw) return false;
    return /^\d{1,3}(?:\+\d{1,2})?$/.test(raw);
}

export function hasKnownPlayer(event: MatchEvent): boolean {
    const player = event.player?.trim();
    return Boolean(player) && !isMinutePlaceholderName(player);
}

export function formatEventPlayer(event: MatchEvent): string {
    const player = event.player?.trim();
    if (!player || isMinutePlaceholderName(player)) return "Buteur";
    return player;
}

function eventMinuteAndSideKey(event: MatchEvent): string {
    return `${eventSortKey(event)}|${eventSide(event).slice(0, 1)}`;
}

function eventMinuteSidePlayerKey(event: MatchEvent): string {
    const side = eventSide(event).slice(0, 1);
    const minute = eventSortKey(event);
    const player = normalizePlayerKey(event.player);
    return `${minute}|${side}|${player}`;
}

function normalizePlayerKey(name?: string): string {
    return (name ?? "")
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

function dedupBucket(event: MatchEvent): number {
    const sortKey = eventSortKey(event);
    if (!Number.isFinite(sortKey) || sortKey === Number.MAX_SAFE_INTEGER) return -1;
    const minute = Math.floor(sortKey / 100);
    return Math.floor(minute / 3);
}

export function compactGoalEvents(goalEvents: MatchEvent[]): MatchEvent[] {
    const namedKeys = new Set(
        goalEvents
            .filter((event) => hasKnownPlayer(event))
            .map((event) => eventMinuteAndSideKey(event))
    );

    const withoutUnnamedDuplicates = goalEvents.filter((event) => {
        if (hasKnownPlayer(event)) return true;
        return !namedKeys.has(eventMinuteAndSideKey(event));
    });

    const byNamedPlayerBucket = new Map<string, MatchEvent>();
    const unnamedEvents: MatchEvent[] = [];

    for (const event of withoutUnnamedDuplicates) {
        const playerKey = normalizePlayerKey(event.player);
        const sideKey = eventSide(event).slice(0, 1);
        const bucket = dedupBucket(event);

        if (!playerKey || !sideKey || bucket < 0) {
            unnamedEvents.push(event);
            continue;
        }

        const key = `${playerKey}|${sideKey}|${bucket}`;
        const prev = byNamedPlayerBucket.get(key);
        if (!prev || eventSortKey(event) >= eventSortKey(prev)) {
            byNamedPlayerBucket.set(key, event);
        }
    }

    return [...byNamedPlayerBucket.values(), ...unnamedEvents].sort((a, b) => eventSortKey(a) - eventSortKey(b));
}

export function removeDisallowedGoals(events: MatchEvent[]): MatchEvent[] {
    const goalsByRichKey = new Map<string, number[]>();
    const goalsByMinuteSideKey = new Map<string, number[]>();

    for (let index = 0; index < events.length; index += 1) {
        const event = events[index];
        if (!isGoalEvent(event.event)) continue;

        const richKey = eventMinuteSidePlayerKey(event);
        const minuteSideKey = eventMinuteAndSideKey(event);
        if (!goalsByRichKey.has(richKey)) goalsByRichKey.set(richKey, []);
        goalsByRichKey.get(richKey)!.push(index);
        if (!goalsByMinuteSideKey.has(minuteSideKey)) goalsByMinuteSideKey.set(minuteSideKey, []);
        goalsByMinuteSideKey.get(minuteSideKey)!.push(index);
    }

    const canceledGoalIndexes = new Set<number>();

    for (let index = 0; index < events.length; index += 1) {
        const event = events[index];
        if (!isGoalDisallowedEvent(event.event)) continue;

        const richKey = eventMinuteSidePlayerKey(event);
        const minuteSideKey = eventMinuteAndSideKey(event);

        const withSamePlayer = (goalsByRichKey.get(richKey) ?? []).filter((goalIndex) => goalIndex < index);
        const candidates = withSamePlayer.length > 0
            ? withSamePlayer
            : (goalsByMinuteSideKey.get(minuteSideKey) ?? []).filter((goalIndex) => goalIndex < index);
        const goalToCancel = candidates.length > 0 ? candidates[candidates.length - 1] : undefined;
        if (goalToCancel !== undefined) canceledGoalIndexes.add(goalToCancel);
    }

    return events.filter((event, index) => isGoalEvent(event.event) && !canceledGoalIndexes.has(index));
}
