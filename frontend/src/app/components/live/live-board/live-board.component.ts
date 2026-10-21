import { Component, Input, inject, signal, computed } from '@angular/core';
import { LiveBoardService } from '../../../services/live-board.service';
import { SearchService } from '../../../services/search.service';
import { UPCOMING_STATUSES, normalizeMatchStatus, isLiveStatus } from '../../../utils/match-status';
import { buildCompetitionGroups } from '../../../utils/match-sort';
import { CompetitionGroupComponent } from '../competition-group/competition-group.component';
import { RankingModalComponent } from '../ranking-modal/ranking-modal.component';
import { LineupModalComponent } from '../lineup-modal/lineup-modal.component';

type Tab = 'live' | 'upcoming' | 'finished';

@Component({
  selector: 'app-live-board',
  standalone: true,
  imports: [CompetitionGroupComponent, RankingModalComponent, LineupModalComponent],
  templateUrl: './live-board.component.html',
  styleUrl: './live-board.component.css',
})
export class LiveBoardComponent {
  @Input() maxGroups?: number;

  private liveBoard = inject(LiveBoardService);
  private searchService = inject(SearchService);

  readonly activeTab = signal<Tab>('live');
  readonly rankingRef = signal<{ id?: string; name?: string } | null>(null);
  readonly lineupRef = signal<{
    id?: number;
    homeName?: string;
    awayName?: string;
  } | null>(null);

  private allMatches = computed(() => this.liveBoard.grouped().flatMap((g) => g.list ?? []));

  private filteredMatches = computed(() => {
    const q = this.searchService.searchTerm().trim().toLowerCase();
    if (!q) return this.allMatches();
    return this.allMatches().filter((m) =>
      [m.home?.name, m.away?.name, m.competition?.name].some((s) => s?.toLowerCase().includes(q)),
    );
  });

  readonly liveCount = computed(
    () => this.filteredMatches().filter((m) => isLiveStatus(m.status)).length,
  );
  readonly upcomingCount = computed(
    () =>
      this.filteredMatches().filter((m) => UPCOMING_STATUSES.has(normalizeMatchStatus(m.status)))
        .length,
  );
  readonly finishedCount = computed(
    () =>
      this.filteredMatches().filter((m) => normalizeMatchStatus(m.status) === 'FINISHED').length,
  );

  readonly tabs = [
    { key: 'live' as Tab, label: 'En cours', count: this.liveCount },
    { key: 'upcoming' as Tab, label: 'A venir', count: this.upcomingCount },
    { key: 'finished' as Tab, label: 'Termines', count: this.finishedCount },
  ];

  private activeGroups = computed(() => {
    const tab = this.activeTab();
    const matches = this.filteredMatches();
    if (tab === 'live') return buildCompetitionGroups(matches, (m) => isLiveStatus(m.status));
    if (tab === 'upcoming')
      return buildCompetitionGroups(matches, (m) =>
        UPCOMING_STATUSES.has(normalizeMatchStatus(m.status)),
      );
    return buildCompetitionGroups(matches, (m) => normalizeMatchStatus(m.status) === 'FINISHED');
  });

  readonly displayGroups = computed(() => {
    const groups = this.activeGroups();
    return this.maxGroups ? groups.slice(0, this.maxGroups) : groups;
  });
}
