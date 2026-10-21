import { Injectable, signal, computed, NgZone, OnDestroy, inject } from '@angular/core';
import type { MatchState, CompetitionGroup } from '../models/match-state.model';

@Injectable({ providedIn: 'root' })
export class LiveBoardService implements OnDestroy {
  private zone = inject(NgZone);
  private matchesSignal = signal<MatchState[]>([]);
  private connectedSignal = signal(false);
  private es: EventSource | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | undefined;
  private backoff = 1000;
  private revision = 0;
  private readonly snapshotController = new AbortController();
  private visibilityHandler: (() => void) | null = null;

  readonly matches = this.matchesSignal.asReadonly();
  readonly connected = this.connectedSignal.asReadonly();

  readonly deduped = computed(() => {
    const seen = new Map<string, MatchState>();
    for (const m of this.matchesSignal()) {
      const key = m.id != null ? String(m.id) : `${m.home?.name}-${m.away?.name}-${m.scheduled}`;
      seen.set(key, m);
    }
    return Array.from(seen.values());
  });

  readonly grouped = computed<CompetitionGroup[]>(() => {
    const map = new Map<
      string,
      { comp: { id?: string; name: string; country?: string }; list: MatchState[] }
    >();
    for (const m of this.deduped()) {
      const c = m.competition;
      const key = String(c?.id ?? c?.name ?? 'Other');
      if (!map.has(key)) {
        map.set(key, {
          comp: {
            id: c?.id ? String(c.id) : undefined,
            name: c?.name ?? 'Other',
            country: c?.country ?? undefined,
          },
          list: [],
        });
      }
      map.get(key)!.list.push(m);
    }
    return Array.from(map.values()).map(({ comp, list }) => ({
      comp,
      list: list.sort((a, b) => (a.scheduled ?? '').localeCompare(b.scheduled ?? '')),
    }));
  });

  constructor() {
    this.fetchSnapshot();
    this.connect();

    this.visibilityHandler = () => {
      if (document.hidden) {
        this.disconnect();
      } else {
        this.fetchSnapshot();
        this.connect();
      }
    };
    document.addEventListener('visibilitychange', this.visibilityHandler);
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.snapshotController.abort();
    if (this.visibilityHandler) {
      document.removeEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  private fetchSnapshot(): void {
    const revision = this.revision;
    fetch('/api/stream/board', { signal: this.snapshotController.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: MatchState[]) => {
        this.zone.run(() => {
          if (revision === this.revision && Array.isArray(data)) this.matchesSignal.set(data);
        });
      })
      .catch(() => {});
  }

  private connect(): void {
    this.disconnect();
    const es = new EventSource('/api/stream/lives');
    this.es = es;

    es.addEventListener('connected', () => {
      this.zone.run(() => {
        this.connectedSignal.set(true);
        this.backoff = 1000;
      });
    });

    es.addEventListener('live', (evt) => {
      this.zone.run(() => {
        this.connectedSignal.set(true);
        this.backoff = 1000;
        try {
          const data = JSON.parse((evt as MessageEvent).data) as MatchState[];
          if (Array.isArray(data)) {
            this.revision++;
            this.matchesSignal.set(data);
          }
        } catch {
          /* An unavailable browser API must not block the page. */
        }
      });
    });

    es.onerror = () => {
      this.zone.run(() => {
        this.connectedSignal.set(false);
      });
      es.close();
      this.reconnectTimer = setTimeout(() => this.connect(), this.backoff);
      this.backoff = Math.min(this.backoff * 2, 30000);
    };
  }

  private disconnect(): void {
    this.es?.close();
    this.es = null;
    clearTimeout(this.reconnectTimer);
    this.connectedSignal.set(false);
  }
}
