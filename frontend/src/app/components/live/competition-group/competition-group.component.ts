import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { MatchState } from '../../../models/match-state.model';
import { formatCompetitionLabel } from '../../../utils/match-sort';
import { MatchCardComponent } from '../match-card/match-card.component';
import { AdSlotComponent } from '../../ads/ad-slot/ad-slot.component';

export interface CompGroup {
  comp: { id?: string; name?: string; country?: string };
  matches: MatchState[];
}

@Component({
  selector: 'app-competition-group',
  standalone: true,
  imports: [MatchCardComponent, AdSlotComponent],
  templateUrl: './competition-group.component.html',
  styleUrl: './competition-group.component.css',
})
export class CompetitionGroupComponent {
  @Input({ required: true }) groups!: CompGroup[];
  @Output() showRanking = new EventEmitter<{ id?: string; name?: string }>();
  @Output() showLineup = new EventEmitter<{
    id?: number;
    homeName?: string;
    awayName?: string;
  }>();

  formatLabel(comp: { name?: string; country?: string }): string {
    return formatCompetitionLabel(comp);
  }
}
