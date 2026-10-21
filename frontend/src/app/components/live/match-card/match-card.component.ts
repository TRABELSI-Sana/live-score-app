import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import type { MatchState, MatchEvent } from '../../../models/match-state.model';
import {
  UPCOMING_STATUSES,
  normalizeMatchStatus,
  statusLabel,
  isLiveStatus,
} from '../../../utils/match-status';
import {
  eventSide,
  eventSortKey,
  formatEventIcon,
  formatEventMinute,
  formatEventPlayer,
  hasKnownPlayer,
  isRedCardEvent,
  compactGoalEvents,
  compactCardEvents,
  removeDisallowedGoals,
} from '../../../utils/match-events';
import { formatLocalTime, resolveDisplayScore } from '../../../utils/match-sort';

interface DisplayEvent extends MatchEvent {
  _type: 'goal' | 'red';
  _side: 'home' | 'away';
  _teamAbbr: string;
}

@Component({
  selector: 'app-match-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.css',
})
export class MatchCardComponent {
  @Input({ required: true }) match!: MatchState;
  @Output() showLineup = new EventEmitter<{
    id?: number;
    homeName?: string;
    awayName?: string;
  }>();

  get status(): string {
    return normalizeMatchStatus(this.match.status);
  }

  get isUpcoming(): boolean {
    return UPCOMING_STATUSES.has(this.status);
  }

  get isFinished(): boolean {
    return this.status === 'FINISHED';
  }

  get isLive(): boolean {
    return isLiveStatus(this.match.status);
  }

  get localScheduled(): string | undefined {
    return formatLocalTime(this.match.scheduled);
  }

  get scoreText(): string {
    return this.isUpcoming ? (this.localScheduled ?? '--:--') : resolveDisplayScore(this.match);
  }

  get displayStatus(): string {
    return statusLabel(this.match.status, this.match.time, this.localScheduled);
  }

  get scoreClass(): string {
    if (this.isLive) return 'match-score--live';
    if (this.isUpcoming) return 'match-score--upcoming';
    return '';
  }

  get statusClass(): string {
    if (this.isLive) return 'match-status--live';
    if (this.isFinished) return 'match-status--finished';
    return 'match-status--upcoming';
  }

  get allEvents(): DisplayEvent[] {
    const sortedEvents = [...(this.match.lastEvents ?? [])].sort(
      (a, b) => eventSortKey(a) - eventSortKey(b),
    );
    const rawGoalEvents = removeDisallowedGoals(sortedEvents);
    const goalEvents = compactGoalEvents(rawGoalEvents);
    const namedGoalEvents = goalEvents.filter((e) => hasKnownPlayer(e));
    const cardEvents = compactCardEvents(sortedEvents.filter((e) => isRedCardEvent(e.event)));
    const homeGoals = namedGoalEvents.filter((e) => eventSide(e).startsWith('h'));
    const awayGoals = namedGoalEvents.filter((e) => eventSide(e).startsWith('a'));
    const homeCards = cardEvents.filter((e) => eventSide(e).startsWith('h'));
    const awayCards = cardEvents.filter((e) => eventSide(e).startsWith('a'));

    const homeName = this.match.home?.name ?? '';
    const awayName = this.match.away?.name ?? '';
    const homeAbbr = homeName.slice(0, 3).toUpperCase();
    const awayAbbr = awayName.slice(0, 3).toUpperCase();

    return [
      ...homeGoals.map((e) => ({
        ...e,
        _type: 'goal' as const,
        _side: 'home' as const,
        _teamAbbr: homeAbbr,
      })),
      ...awayGoals.map((e) => ({
        ...e,
        _type: 'goal' as const,
        _side: 'away' as const,
        _teamAbbr: awayAbbr,
      })),
      ...homeCards.map((e) => ({
        ...e,
        _type: 'red' as const,
        _side: 'home' as const,
        _teamAbbr: homeAbbr,
      })),
      ...awayCards.map((e) => ({
        ...e,
        _type: 'red' as const,
        _side: 'away' as const,
        _teamAbbr: awayAbbr,
      })),
    ];
  }

  formatIcon(event: MatchEvent): string {
    return formatEventIcon(event);
  }

  formatPlayer(event: MatchEvent): string {
    return formatEventPlayer(event);
  }

  formatMinute(time?: string): string {
    return formatEventMinute(time);
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}
