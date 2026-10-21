import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal } from '@angular/core';
import {
  parseLineupsPayload,
  splitPlayersForPitch,
  type ParsedLineups,
  type TeamLineup,
  type LineupPlayer,
} from '../../utils/lineups';

@Component({
  selector: 'app-lineup-modal',
  standalone: true,
  template: `
    <div class="modal-backdrop" (click)="dismissed.emit()" role="dialog" aria-modal="true">
      <div class="modal-content modal-content--lg" (click)="$event.stopPropagation()">
        <button type="button" class="modal-close" aria-label="Fermer" (click)="dismissed.emit()">
          &times;
        </button>
        <div class="modal-title">
          Compositions — {{ match.homeName ?? 'Domicile' }} vs {{ match.awayName ?? 'Exterieur' }}
        </div>
        @if (displayStatus === 'loading') {
          <div class="modal-status">Chargement...</div>
        }
        @if (displayStatus === 'error') {
          <div class="modal-status modal-status--error">Compositions indisponibles.</div>
        }
        @if (displayStatus === 'idle') {
          <div class="lineup-grid">
            @if (lineups().home) {
              <div class="lineup-team">
                <div class="lineup-team-header">
                  <strong>{{ lineups().home!.teamName }}</strong>
                  <span>{{ lineups().home!.formation ?? '--' }}</span>
                </div>
                <div class="lineup-pitch">
                  @for (line of getLines(lineups().home!); track $index) {
                    <div class="lineup-line">
                      @for (player of line; track $index) {
                        <div class="lineup-player">
                          <span class="lineup-player-number">{{ player.number ?? '-' }}</span>
                          <span class="lineup-player-name">{{ player.name }}</span>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
            @if (lineups().away) {
              <div class="lineup-team lineup-team--away">
                <div class="lineup-team-header">
                  <strong>{{ lineups().away!.teamName }}</strong>
                  <span>{{ lineups().away!.formation ?? '--' }}</span>
                </div>
                <div class="lineup-pitch">
                  @for (line of getLines(lineups().away!); track $index) {
                    <div class="lineup-line">
                      @for (player of line; track $index) {
                        <div class="lineup-player">
                          <span class="lineup-player-number">{{ player.number ?? '-' }}</span>
                          <span class="lineup-player-name">{{ player.name }}</span>
                        </div>
                      }
                    </div>
                  }
                </div>
              </div>
            }
            @if (!lineups().home && !lineups().away) {
              <div class="modal-status">Aucune composition disponible.</div>
            }
          </div>
        }
      </div>
    </div>
  `,
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
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))
      )
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
