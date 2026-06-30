export const UPCOMING_STATUSES = new Set(["NOT STARTED", "SCHEDULED"]);

export function normalizeMatchStatus(status?: string): string {
    if (!status) return "UNKNOWN";
    const normalized = status.trim().toUpperCase().replace(/[_-]/g, " ").replace(/\s+/g, " ");
    if (["NS", "TBD"].includes(normalized)) return "NOT STARTED";
    if (["1H", "2H", "ET", "LIVE"].includes(normalized)) return "IN PLAY";
    if (["HT", "BT", "HALF TIME"].includes(normalized)) return "HALF TIME BREAK";
    if (["FT", "AET", "AFTER EXTRA TIME", "PEN", "PENALTIES"].includes(normalized)) return "FINISHED";
    return normalized;
}

export function statusLabel(status?: string, time?: string, scheduled?: string): string {
    const normalized = normalizeMatchStatus(status);
    if (!status) return scheduled ?? "--:--";
    if (normalized === "IN PLAY" || normalized === "ADDED TIME") return time ? `${time}'` : "EN COURS";
    if (normalized === "HALF TIME BREAK") return "MT";
    if (normalized === "FINISHED") return "TERMINE";
    if (UPCOMING_STATUSES.has(normalized)) return scheduled ?? "A VENIR";
    return normalized;
}

export function isLiveStatus(status?: string): boolean {
    const normalized = normalizeMatchStatus(status);
    return normalized === "IN PLAY" || normalized === "ADDED TIME" || normalized === "HALF TIME BREAK";
}
