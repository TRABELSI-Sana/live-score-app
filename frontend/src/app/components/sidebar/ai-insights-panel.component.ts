import { Component, Input, Output, EventEmitter, OnInit, OnChanges, OnDestroy, signal } from '@angular/core';

type Focus = 'overview' | 'live' | 'upcoming' | 'finished';
type Reply = { answer: string; status: string; generatedAt?: string };

const defaults = [
  'Quels matchs restent ouverts ?',
  'Quels sont les prochains coups d\'envoi ?',
  'Que retenir des résultats ?',
];

@Component({
  selector: 'app-ai-insights-panel',
  standalone: true,
  template: `
    <section class="assistant-view" aria-labelledby="insights-title">
      <header class="assistant-view-header">
        <span class="assistant-kicker">L'ANALYSE DES MATCHS</span>
        <h2 id="insights-title">Un autre regard sur le jeu.</h2>
        <p>Posez votre question sur les rencontres du jour.</p>
      </header>
      <div class="insights-body">
        <div class="insights-suggestions">
          @for (q of suggestions(); track q) {
            <button type="button" [disabled]="loading()" (click)="analyze(q)">
              {{ q }}<span aria-hidden="true">↗</span>
            </button>
          }
        </div>
        <form (submit)="onSubmit($event)">
          <label for="insights-focus">Les rencontres à analyser</label>
          <select id="insights-focus" [value]="focus()" [disabled]="loading()" (change)="onFocusChange($event)">
            <option value="overview">La sélection du jour</option>
            <option value="live">En direct</option>
            <option value="upcoming">À venir</option>
            <option value="finished">Terminées</option>
          </select>
          <label for="insights-question">Votre question</label>
          <textarea
            id="insights-question"
            [value]="prompt()"
            (input)="prompt.set(asInput($event).value)"
            maxlength="600"
            placeholder="Un match à suivre ? Un score à comprendre ?"
            rows="3"
            [disabled]="loading()"
          ></textarea>
          <button class="assistant-primary" type="submit" [disabled]="loading() || !prompt().trim()">
            {{ loading() ? 'Analyse en cours…' : 'Analyser les rencontres' }}
            <span aria-hidden="true">↗</span>
          </button>
        </form>
        @if (loading()) {
          <div class="insights-pending" role="status">
            <span class="briefing-spinner"></span>Lecture des données des matchs…
          </div>
        }
        @if (reply()) {
          <div [class]="'insights-answer' + (reply()!.status === 'ok' ? '' : ' insights-answer--notice')" aria-live="polite">
            <span class="assistant-kicker">{{ reply()!.status === 'ok' ? 'L’ÉCLAIRAGE IA' : 'À SAVOIR' }}</span>
            <p class="insights-answer-question">{{ reply()!.question }}</p>
            <p>{{ reply()!.answer }}</p>
            @if (reply()!.status !== 'ok' && reply()!.status !== 'empty') {
              <button type="button" (click)="analyze(reply()!.question)">Réessayer</button>
            }
          </div>
        }
        <button class="assistant-chat-link" type="button" (click)="chat.emit()">
          Envie de poursuivre la discussion ? <span>Ouvrir le chat →</span>
        </button>
        <p class="assistant-disclaimer">Une lecture des données disponibles, sans pronostic de résultat.</p>
      </div>
    </section>
  `,
})
export class AiInsightsPanelComponent implements OnInit, OnChanges, OnDestroy {
  @Input() initialFocus: Focus = 'overview';
  @Output() chat = new EventEmitter<void>();

  readonly focus = signal<Focus>('overview');
  readonly prompt = signal('');
  readonly suggestions = signal<string[]>(defaults);
  readonly reply = signal<(Reply & { question: string }) | null>(null);
  readonly loading = signal(false);
  private controller: AbortController | null = null;
  private suggestionsController: AbortController | null = null;

  ngOnChanges(): void {
    this.focus.set(this.initialFocus);
    this.reply.set(null);
  }

  ngOnInit(): void {
    this.focus.set(this.initialFocus);
    const abort = new AbortController();
    this.suggestionsController = abort;
    fetch('/api/ai/suggestions', { signal: abort.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.suggestions)) {
          this.suggestions.set(
            data.suggestions
              .filter((s: unknown): s is string => typeof s === 'string')
              .slice(0, 3)
          );
        }
      })
      .catch(() => {});
  }

  ngOnDestroy(): void {
    this.controller?.abort();
    this.suggestionsController?.abort();
  }

  async analyze(question: string): Promise<void> {
    if (!question.trim() || this.loading()) return;
    this.controller?.abort();
    const abort = new AbortController();
    this.controller = abort;
    this.loading.set(true);
    this.prompt.set(question);
    this.reply.set(null);
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: question,
          focus: this.focus(),
          maxMatches: 4,
        }),
        signal: abort.signal,
      });
      if (!response.ok) throw new Error('Analyse indisponible');
      const result = (await response.json()) as Reply;
      if (!result.answer?.trim()) throw new Error('Réponse vide');
      this.reply.set({ ...result, question });
    } catch {
      if (!abort.signal.aborted) {
        this.reply.set({
          answer: "L'analyse est momentanément indisponible. Vous pouvez réessayer.",
          status: 'error',
          question,
        });
      }
    } finally {
      if (!abort.signal.aborted) this.loading.set(false);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    void this.analyze(this.prompt());
  }

  onFocusChange(event: Event): void {
    this.focus.set((event.target as HTMLSelectElement).value as Focus);
    this.reply.set(null);
  }

  asInput(event: Event): HTMLTextAreaElement {
    return event.target as HTMLTextAreaElement;
  }
}
