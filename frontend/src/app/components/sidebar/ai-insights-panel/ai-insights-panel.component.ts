import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  OnDestroy,
  signal,
} from '@angular/core';

type Focus = 'overview' | 'live' | 'upcoming' | 'finished';
type Reply = { answer: string; status: string; generatedAt?: string };

const defaults = [
  'Quels matchs restent ouverts ?',
  "Quels sont les prochains coups d'envoi ?",
  'Que retenir des résultats ?',
];

@Component({
  selector: 'app-ai-insights-panel',
  standalone: true,
  templateUrl: './ai-insights-panel.component.html',
  styleUrl: './ai-insights-panel.component.css',
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
            data.suggestions.filter((s: unknown): s is string => typeof s === 'string').slice(0, 3),
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
