import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal } from '@angular/core';
import {
  parseLineupsPayload,
  splitPlayersForPitch,
  type ParsedLineups,
  type TeamLineup,
  type LineupPlayer,
} from '../../../utils/lineups';

@Component({
  selector: 'app-lineup-modal',
  standalone: true,
  templateUrl: './lineup-modal.component.html',
  styleUrl: './lineup-modal.component.css',
})
export class LineupModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) match!: {
    id?: number;
    homeName?: string;
    awayName?: string;
  };
  @Output() dismissed = new EventEmitter<void>();

  private readonly controller = new AbortController();

  ngOnDestroy(): void {
    this.controller.abort();
  }

  readonly lineups = signal<ParsedLineups>({});
  readonly status = signal<'loading' | 'idle' | 'error'>('loading');

  get displayStatus(): 'loading' | 'idle' | 'error' {
    return this.match.id ? this.status() : 'error';
  }

  ngOnInit(): void {
    if (!this.match.id) {
      this.status.set('error');
      return;
    }
    fetch(`/api/stream/matches/${this.match.id}/lineups`, { signal: this.controller.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        this.lineups.set(parseLineupsPayload(data));
        this.status.set('idle');
      })
      .catch(() => {
        if (this.controller.signal.aborted) return;
        this.lineups.set({});
        this.status.set('error');
      });
  }

  getLines(team: TeamLineup): LineupPlayer[][] {
    return splitPlayersForPitch(team.players, team.formation);
  }
}
