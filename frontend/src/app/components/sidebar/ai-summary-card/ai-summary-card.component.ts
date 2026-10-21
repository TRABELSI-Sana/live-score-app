import { Component, signal, effect, untracked, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatLocalTime } from '../../../utils/match-sort';
import { LineupModalComponent } from '../../live/lineup-modal/lineup-modal.component';
import { AiInsightsPanelComponent } from '../ai-insights-panel/ai-insights-panel.component';
import { GeneralChatComponent } from '../general-chat/general-chat.component';

type View = 'briefing' | 'insights' | 'chat';
type Focus = 'overview' | 'live' | 'upcoming';

interface Highlight {
  id: number | null;
  home: string;
  away: string;
  homeLogo: string | null;
  awayLogo: string | null;
  competition: string;
  country: string | null;
  phase: 'live' | 'upcoming' | 'finished';
  score: string | null;
  minute: string | null;
  kickoff: string | null;
  label: string;
  reason: string;
}

interface Briefing {
  headline: string;
  description: string;
  liveCount: number;
  upcomingCount: number;
  finishedCount: number;
  competitionCount: number;
  highlights: Highlight[];
  generatedAt: string;
}

@Component({
  selector: 'app-ai-summary-card',
  standalone: true,
  imports: [RouterLink, LineupModalComponent, AiInsightsPanelComponent, GeneralChatComponent],
  templateUrl: './ai-summary-card.component.html',
  styleUrl: './ai-summary-card.component.css',
})
export class AiSummaryCardComponent implements OnDestroy {
  readonly view = signal<View>('briefing');
  readonly visited = signal({ insights: false, chat: false });
  readonly focus = signal<Focus>('overview');
  readonly expanded = signal(false);
  readonly showAll = signal(false);
  readonly data = signal<{ focus: Focus; briefing: Briefing } | null>(null);
  readonly failed = signal(false);
  readonly revision = signal(0);
  readonly selectedMatch = signal<Highlight | null>(null);
  readonly imgFailed: Record<string, boolean> = {};

  private controller: AbortController | null = null;
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;

  readonly viewTabs = [
    { key: 'briefing' as View, label: 'Briefing' },
    { key: 'insights' as View, label: 'Analyse IA' },
    { key: 'chat' as View, label: 'Chat' },
  ];

  get focusTabs(): {
    key: Focus;
    label: string;
    count: number | undefined;
  }[] {
    return [
      { key: 'overview', label: 'À la une', count: undefined },
      {
        key: 'live',
        label: 'En direct',
        count: this.data()?.briefing.liveCount,
      },
      {
        key: 'upcoming',
        label: 'À venir',
        count: this.data()?.briefing.upcomingCount,
      },
    ];
  }

  private loadEffect = effect(() => {
    const focus = this.focus();
    this.revision();
    untracked(() => this.loadBriefing(focus));
  });

  ngOnDestroy(): void {
    this.controller?.abort();
    clearTimeout(this.refreshTimer);
  }

  briefing(): Briefing | null {
    const d = this.data();
    return d?.focus === this.focus() ? d.briefing : null;
  }

  visibleHighlights(): Highlight[] {
    const b = this.briefing();
    if (!b) return [];
    return b.highlights.slice(0, this.showAll() ? 3 : 2);
  }

  updated(): string | null {
    const b = this.briefing();
    if (!b?.highlights.length) return null;
    return new Date(b.generatedAt).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  openView(next: View): void {
    this.view.set(next);
    if (next !== 'briefing') {
      this.visited.update((v) => ({ ...v, [next]: true }));
    }
  }

  changeFocus(next: Focus): void {
    this.focus.set(next);
    this.showAll.set(false);
    this.failed.set(false);
  }

  retry(): void {
    this.failed.set(false);
    this.revision.update((v) => v + 1);
  }

  highlightLabel(match: Highlight): string {
    const b = this.briefing();
    if (!b) return match.label;
    const minutesUntil = match.kickoff
      ? Math.ceil((Date.parse(match.kickoff) - Date.parse(b.generatedAt)) / 60_000)
      : null;
    if (
      match.phase === 'upcoming' &&
      minutesUntil !== null &&
      minutesUntil > 0 &&
      minutesUntil <= 60
    ) {
      return `Coup d'envoi dans ${minutesUntil} min`;
    }
    return match.label;
  }

  getCenter(match: Highlight): string {
    if (match.phase === 'upcoming') {
      const time = match.kickoff ? formatLocalTime(match.kickoff) : undefined;
      return time ?? 'À venir';
    }
    return match.score ?? '–';
  }

  getStatus(match: Highlight): string {
    if (match.phase === 'live') return match.minute ? `${match.minute}′` : 'En cours';
    if (match.phase === 'finished') return 'Terminé';
    return 'Heure locale';
  }

  onCrestError(logo: string): void {
    this.imgFailed[logo] = true;
  }

  private async loadBriefing(focus: Focus): Promise<void> {
    this.controller?.abort();
    clearTimeout(this.refreshTimer);
    const controller = new AbortController();
    this.controller = controller;
    try {
      const response = await fetch(`/api/ai/briefing?focus=${focus}`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = (await response.json()) as Briefing;
      if (!Array.isArray(result.highlights)) throw new Error('Briefing indisponible');
      if (!controller.signal.aborted) {
        this.data.set({ focus, briefing: result });
        this.failed.set(false);
      }
    } catch {
      if (!controller.signal.aborted) this.failed.set(true);
    }
    if (!controller.signal.aborted) {
      this.refreshTimer = setTimeout(() => this.loadBriefing(this.focus()), 60_000);
    }
  }
}
