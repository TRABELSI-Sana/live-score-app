import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { MatchState } from "./useLiveBoard";

type LiveBoardState = {
  matches: MatchState[];
  connected: boolean;
  grouped: Array<{ comp: { id?: string; name: string; country?: string }; list: MatchState[] }>;
};

const LiveBoardContext = createContext<LiveBoardState | null>(null);

export function LiveBoardProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<MatchState[]>([]);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stream/board")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: MatchState[]) => {
        if (!cancelled) setMatches(Array.isArray(data) ? data : []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout>;
    let backoff = 1000;

    function connect() {
      es = new EventSource("/api/stream/lives");
      esRef.current = es;

      es.addEventListener("connected", () => {
        setConnected(true);
        backoff = 1000;
      });

      es.addEventListener("live", (evt) => {
        setConnected(true);
        backoff = 1000;
        try {
          const data = JSON.parse((evt as MessageEvent).data) as MatchState[];
          setMatches(data);
        } catch {}
      });

      es.onerror = () => {
        setConnected(false);
        es?.close();
        reconnectTimer = setTimeout(connect, backoff);
        backoff = Math.min(backoff * 2, 30000);
      };
    }

    function handleVisibility() {
      if (document.hidden) {
        es?.close();
        clearTimeout(reconnectTimer);
        setConnected(false);
      } else {
        connect();
      }
    }

    connect();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      es?.close();
      clearTimeout(reconnectTimer);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const deduped = useMemo(() => {
    const seen = new Map<string, MatchState>();
    for (const m of matches) {
      const key = m.id != null ? String(m.id) : `${m.home?.name}-${m.away?.name}-${m.scheduled}`;
      seen.set(key, m);
    }
    return Array.from(seen.values());
  }, [matches]);

  const grouped = useMemo(() => {
    const map = new Map<string, { comp: { id?: string; name: string; country?: string }; list: MatchState[] }>();
    for (const m of deduped) {
      const c = m.competition;
      const key = String(c?.id ?? c?.name ?? "Other");
      if (!map.has(key)) {
        map.set(key, {
          comp: { id: c?.id ? String(c.id) : undefined, name: c?.name ?? "Other", country: c?.country ?? undefined },
          list: [],
        });
      }
      map.get(key)!.list.push(m);
    }
    return Array.from(map.values()).map(({ comp, list }) => ({
      comp,
      list: list.sort((a, b) => (a.scheduled ?? "").localeCompare(b.scheduled ?? "")),
    }));
  }, [deduped]);

  const value = useMemo(() => ({ matches: deduped, connected, grouped }), [deduped, connected, grouped]);

  return <LiveBoardContext.Provider value={value}>{children}</LiveBoardContext.Provider>;
}

export function useLiveBoardContext(): LiveBoardState {
  const ctx = useContext(LiveBoardContext);
  if (!ctx) throw new Error("useLiveBoardContext must be used within LiveBoardProvider");
  return ctx;
}
