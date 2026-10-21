import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LiveBoardService } from '../../../services/live-board.service';
import { isLiveStatus, normalizeMatchStatus, UPCOMING_STATUSES } from '../../../utils/match-status';
import { resolveDisplayScore } from '../../../utils/match-sort';
import type { MatchState } from '../../../models/match-state.model';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css',
})
export class HeroSectionComponent {
  private liveBoard = inject(LiveBoardService);

  private allMatches = computed(() => this.liveBoard.grouped().flatMap((g) => g.list ?? []));

  readonly liveMatches = computed(() => this.allMatches().filter((m) => isLiveStatus(m.status)));

  readonly upcomingCount = computed(
    () =>
      this.allMatches().filter((m) => UPCOMING_STATUSES.has(normalizeMatchStatus(m.status))).length,
  );

  readonly finishedCount = computed(
    () => this.allMatches().filter((m) => normalizeMatchStatus(m.status) === 'FINISHED').length,
  );

  readonly featured = computed(() => this.liveMatches()[0] ?? null);

  getScore(match: MatchState): string {
    return resolveDisplayScore(match);
  }
}
