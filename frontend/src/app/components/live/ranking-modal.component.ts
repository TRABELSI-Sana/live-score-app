import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal } from '@angular/core';
import { tableRowsFromData, type TableDisplayRow } from '../../utils/table-data';

@Component({
  selector: 'app-ranking-modal',
  standalone: true,
  template: `
    <div class="modal-backdrop" (click)="dismissed.emit()" role="dialog" aria-modal="true">
      <div class="modal-content modal-content--md" (click)="$event.stopPropagation()">
        <button type="button" class="modal-close" aria-label="Fermer" (click)="dismissed.emit()">
          &times;
        </button>
        <div class="modal-title">
          {{ competition.name
            ? 'Classement — ' + competition.name + (groupName() ? ' (Groupe ' + groupName() + ')' : '')
            : 'Classement' }}
        </div>
        @if (displayStatus === 'loading') {
          <div class="modal-status">Chargement...</div>
        }
        @if (displayStatus === 'error') {
          <div class="modal-status modal-status--error">Classement indisponible.</div>
        }
        @if (displayStatus === 'idle' && rows().length > 0) {
          <table class="ranking-table">
            <thead>
              <tr>
                <th>Rg</th>
                <th>Equipe</th>
                <th>Pts</th>
                <th>J.</th>
                <th>Diff</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track $index) {
                <tr>
                  <td>{{ row.rank }}</td>
                  <td>{{ row.team }}</td>
                  <td>{{ row.points }}</td>
                  <td>{{ row.played }}</td>
                  <td>{{ row.diff }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
        @if (displayStatus === 'idle' && rows().length === 0) {
          <div class="modal-status">Aucune donnee de classement.</div>
        }
      </div>
    </div>
  `,
})
export class RankingModalComponent implements OnInit, OnDestroy {
  @Input({ required: true }) competition!: {
    id?: string;
    name?: string;
    groupName?: string;
    teamIds?: string[];
  };
  @Output() dismissed = new EventEmitter<void>();

  private readonly controller = new AbortController();
  private retryTimer?: ReturnType<typeof setTimeout>;

  ngOnDestroy(): void {
    this.controller.abort();
    clearTimeout(this.retryTimer);
  }

  readonly rows = signal<TableDisplayRow[]>([]);
  readonly status = signal<'loading' | 'idle' | 'error'>('loading');
  readonly groupName = signal<string | undefined>(undefined);

  get displayStatus(): 'loading' | 'idle' | 'error' {
    return this.competition.id ? this.status() : 'error';
  }

  ngOnInit(): void {
    this.groupName.set(this.competition.groupName);
    if (!this.competition.id) {
      this.status.set('error');
      return;
    }
    this.loadTable(0);
  }

  private loadTable(attempt: number): void {
    fetch(`/api/stream/competitions/${this.competition.id}/table`, { signal: this.controller.signal })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))
      )
      .then((data) => {
        if (this.controller.signal.aborted) return;
        const result = tableRowsFromData(
          data,
          this.competition.groupName,
          this.competition.teamIds ?? []
        );
        if (result.rows.length === 0 && attempt < 2) {
          this.retryTimer = setTimeout(() => this.loadTable(attempt + 1), 1000);
          return;
        }
        this.rows.set(result.rows);
        if (!this.competition.groupName && result.groupName) {
          this.groupName.set(result.groupName);
        }
        this.status.set('idle');
      })
      .catch(() => {
        if (this.controller.signal.aborted) return;
        this.rows.set([]);
        this.status.set('error');
      });
  }
}
