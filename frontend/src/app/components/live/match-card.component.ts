import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import type { MatchState, MatchEvent } from '../../models/match-state.model';
import {
  UPCOMING_STATUSES,
  normalizeMatchStatus,
  statusLabel,
  isLiveStatus,
} from '../../utils/match-status';
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
} from '../../utils/match-events';
import { formatLocalTime, resolveDisplayScore } from '../../utils/match-sort';

interface DisplayEvent extends MatchEvent {
  _type: 'goal' | 'red';
  _side: 'home' | 'away';
  _teamAbbr: string;
}

@Component({
  selector: 'app-match-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article [class]="'match-card' + (isLive ? ' match-card--live' : '')">
      <div class="match-card-main">
        <div class="match-team">
          @if (match.home?.logo) {
            <img
              class="match-team-logo"
              [src]="match.home.logo"
              [alt]="match.home.name ?? ''"
              loading="lazy"
              (error)="onImgError($event)"
            />
          } @else {
            <span class="match-team-logo-placeholder"></span>
          }
          <span class="match-team-name">{{ match.home?.name ?? 'Equipe' }}</span>
        </div>

        <div class="match-score-center">
          <span [class]="'match-score ' + scoreClass">{{ scoreText }}</span>
          <span [class]="'match-status ' + statusClass">
            @if (isLive) { <span class="live-dot"></span> }
            {{ displayStatus }}
          </span>
        </div>

        <div class="match-team match-team--away">
          <span class="match-team-name">{{ match.away?.name ?? 'Equipe' }}</span>
          @if (match.away?.logo) {
            <img
              class="match-team-logo"
              [src]="match.away.logo"
              [alt]="match.away.name ?? ''"
              loading="lazy"
              (error)="onImgError($event)"
            />
          } @else {
            <span class="match-team-logo-placeholder"></span>
          }
        </div>
      </div>

      @if (allEvents.length > 0) {
        <div class="match-card-events">
          @for (event of allEvents; track $index) {
            <span [class]="'match-event match-event--' + event._type + ' match-event--' + event._side">
              {{ event._type === 'goal' ? '⚽' : formatIcon(event) }}
              <span class="match-event-team">{{ event._teamAbbr }}</span>
              {{ formatPlayer(event) }} {{ formatMinute(event.time) }}
            </span>
          }
        </div>
      }

      <div class="match-card-footer">
        <span class="match-card-competition">{{ match.competition?.name ?? '' }}</span>
        <button
          type="button"
          class="match-card-lineup-btn"
          (click)="showLineup.emit({ id: match.id, homeName: match.home?.name, awayName: match.away?.name })"
          [disabled]="!match.id"
        >Compos</button>
      </div>
    </article>
  `,
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
    return this.isUpcoming
      ? this.localScheduled ?? '--:--'
      : resolveDisplayScore(this.match);
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
      (a, b) => eventSortKey(a) - eventSortKey(b)
    );
    const rawGoalEvents = removeDisallowedGoals(sortedEvents);
    const goalEvents = compactGoalEvents(rawGoalEvents);
    const namedGoalEvents = goalEvents.filter((e) => hasKnownPlayer(e));
    const cardEvents = compactCardEvents(
      sortedEvents.filter((e) => isRedCardEvent(e.event))
    );
    const homeGoals = namedGoalEvents.filter((e) =>
      eventSide(e).startsWith('h')
    );
    const awayGoals = namedGoalEvents.filter((e) =>
      eventSide(e).startsWith('a')
    );
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
