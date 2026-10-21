import { Component, Input, Output, EventEmitter } from '@angular/core';
import type { MatchState } from '../../models/match-state.model';
import { formatCompetitionLabel } from '../../utils/match-sort';
import { MatchCardComponent } from './match-card.component';
import { AdSlotComponent } from '../ads/ad-slot.component';

export interface CompGroup {
  comp: { id?: string; name?: string; country?: string };
  matches: MatchState[];
}

@Component({
  selector: 'app-competition-group',
  standalone: true,
  imports: [MatchCardComponent, AdSlotComponent],
  template: `
    @for (group of groups; track group.comp.id ?? group.comp.name; let i = $index) {
      <div class="competition-group">
        <div class="competition-header">
          <span class="competition-name">{{ formatLabel(group.comp) }}</span>
          <div class="competition-actions">
            <span class="competition-count">
              {{ group.matches.length }} match{{ group.matches.length > 1 ? 's' : '' }}
            </span>
            @if (group.comp.id) {
              <button
                type="button"
                class="competition-btn"
                (click)="showRanking.emit({ id: group.comp.id!, name: group.comp.name })"
              >Classement</button>
            }
          </div>
        </div>
        <div class="match-grid">
          @for (match of group.matches; track match.id ?? (match.home?.name + '-' + match.away?.name)) {
            <app-match-card
              [match]="match"
              (showLineup)="showLineup.emit($event)"
            />
          }
        </div>
      </div>
      @if (i % 3 === 2) {
        <app-ad-slot variant="in-feed" slot="8567185183" />
      }
    }
  `,
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
