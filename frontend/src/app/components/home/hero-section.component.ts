import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LiveBoardService } from '../../services/live-board.service';
import {
  isLiveStatus,
  normalizeMatchStatus,
  UPCOMING_STATUSES,
} from '../../utils/match-status';
import { resolveDisplayScore } from '../../utils/match-sort';
import type { MatchState } from '../../models/match-state.model';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Scores de football en direct</h1>
        <p class="hero-subtitle">
          Suivez les matchs du jour en temps reel : scores, buteurs, cartons et classements.
          Ligue 1, Premier League, Liga, Serie A, Bundesliga et competitions internationales.
        </p>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="hero-stat-value hero-stat-value--live">{{ liveMatches().length }}</span>
            <span class="hero-stat-label">En direct</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-value">{{ upcomingCount() }}</span>
            <span class="hero-stat-label">A venir</span>
          </div>
          <div class="hero-stat">
            <span class="hero-stat-value">{{ finishedCount() }}</span>
            <span class="hero-stat-label">Termines</span>
          </div>
        </div>
        <a routerLink="/en-direct" class="hero-cta">Voir tous les matchs →</a>
      </div>

      @if (featured()) {
        <div class="hero-featured">
          <div class="hero-featured-label">
            <span class="live-dot"></span> Match en direct
          </div>
          <div class="hero-featured-teams">
            {{ featured()!.home?.name }} vs {{ featured()!.away?.name }}
          </div>
          <div class="hero-featured-score">{{ getScore(featured()!) }}</div>
        </div>
      }
    </section>
  `,
})
export class HeroSectionComponent {
  private liveBoard = inject(LiveBoardService);

  private allMatches = computed(() =>
    this.liveBoard.grouped().flatMap((g) => g.list ?? [])
  );

  readonly liveMatches = computed(() =>
    this.allMatches().filter((m) => isLiveStatus(m.status))
  );

  readonly upcomingCount = computed(
    () =>
      this.allMatches().filter((m) =>
        UPCOMING_STATUSES.has(normalizeMatchStatus(m.status))
      ).length
  );

  readonly finishedCount = computed(
    () =>
      this.allMatches().filter(
        (m) => normalizeMatchStatus(m.status) === 'FINISHED'
      ).length
  );

  readonly featured = computed(() => this.liveMatches()[0] ?? null);

  getScore(match: MatchState): string {
    return resolveDisplayScore(match);
  }
}
