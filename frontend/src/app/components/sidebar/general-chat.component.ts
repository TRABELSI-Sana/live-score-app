import {
  Component,
  OnDestroy,
  AfterViewChecked,
  ViewChild,
  ElementRef,
  signal,
  computed,
} from '@angular/core';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  status: 'ok' | 'error';
}

const storageKey = 'livefoot.assistant.history.v1';
const defaultSuggestions = [
  'Explique Kubernetes simplement',
  "Aide-moi à rédiger un message",
  'Quels sont les prochains matchs ?',
];

function savedMessages(): Message[] {
  try {
    const value: unknown = JSON.parse(
      sessionStorage.getItem(storageKey) ?? '[]'
    );
    return Array.isArray(value)
      ? value
          .filter(
            (m): m is Message =>
              m &&
              (m.role === 'user' || m.role === 'assistant') &&
              typeof m.content === 'string' &&
              typeof m.id === 'string' &&
              (m.status === 'ok' || m.status === 'error')
          )
          .slice(-40)
      : [];
  } catch {
    return [];
  }
}

@Component({
  selector: 'app-general-chat',
  standalone: true,
  template: `
    <section class="assistant-view" aria-labelledby="chat-title">
      <header class="assistant-view-header">
        <span class="assistant-kicker">VOTRE ASSISTANT IA</span>
        <h2 id="chat-title">On en parle ?</h2>
        <p>Pour comprendre, écrire, coder ou discuter d'un match.</p>
      </header>
      <div class="chat-toolbar">
        <span>Historique de cet onglet</span>
        <button type="button" (click)="reset()" [disabled]="!messages().length && !loading()" aria-label="Effacer la conversation et commencer une nouvelle discussion">
          Nouvelle discussion <span aria-hidden="true">↗</span>
        </button>
      </div>
      <div class="chat-thread" #thread role="log" aria-label="Historique de la conversation" aria-live="polite" aria-relevant="additions">
        @if (!messages().length) {
          <div class="chat-welcome">
            <span class="chat-welcome-mark" aria-hidden="true">LF<span>✦</span></span>
            <h3>Qu'est-ce qu'on explore ?</h3>
            <p>Une idée à clarifier ou une question précise ? Commencez ici.</p>
            <div class="chat-suggestions">
              @for (q of suggestions; track q) {
                <button type="button" (click)="send(q)">{{ q }}<span aria-hidden="true">↗</span></button>
              }
            </div>
          </div>
        }
        @for (message of messages(); track message.id) {
          <div [class]="'chat-message chat-message--' + message.role + (message.status === 'error' ? ' chat-message--error' : '')">
            <span class="chat-message-label">{{ message.role === 'user' ? 'Vous' : 'Assistant' }}</span>
            <div>{{ message.content }}</div>
          </div>
        }
        @if (loading()) {
          <div class="chat-typing" role="status">
            <span></span><span></span><span></span>
            <span class="sr-only">L'assistant prépare sa réponse.</span>
          </div>
        }
        @if (lastIsError() && !loading()) {
          <button type="button" class="chat-retry" (click)="retryLast()">Réessayer cette question ↻</button>
        }
      </div>
      <form class="chat-composer" (submit)="onSubmit($event)">
        <label class="sr-only" for="chat-message">Votre message à l'assistant</label>
        <textarea
          id="chat-message"
          [value]="draft()"
          (input)="draft.set(asInput($event).value)"
          maxlength="1000"
          placeholder="Posez votre question…"
          rows="2"
          [disabled]="loading()"
          (keydown)="onKeyDown($event)"
        ></textarea>
        <button type="submit" [disabled]="!draft().trim() || loading()" aria-label="Envoyer le message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path d="m5 12 7-7 7 7M12 5v15" />
          </svg>
        </button>
        <span>{{ draft().length }}/1000</span>
      </form>
      <p class="assistant-disclaimer chat-disclaimer">Historique conservé pendant la session. Les réponses IA peuvent être inexactes.</p>
    </section>
  `,
})
export class GeneralChatComponent implements OnDestroy, AfterViewChecked {
  @ViewChild('thread') thread!: ElementRef<HTMLDivElement>;

  readonly messages = signal<Message[]>(savedMessages());
  readonly draft = signal('');
  readonly loading = signal(false);
  readonly suggestions = defaultSuggestions;

  private controller: AbortController | null = null;
  private shouldScroll = false;

  readonly lastIsError = computed(() => {
    const messages = this.messages();
    return messages.at(-1)?.status === 'error' && messages.at(-2)?.role === 'user';
  });

  ngAfterViewChecked(): void {
    if (this.shouldScroll && this.thread) {
      this.thread.nativeElement.scrollTop =
        this.thread.nativeElement.scrollHeight;
      this.shouldScroll = false;
    }
  }

  ngOnDestroy(): void {
    this.controller?.abort();
  }

  async send(text: string, retry = false): Promise<void> {
    const question = text.trim().slice(0, 1000);
    if (!question || this.loading()) return;
    const abort = new AbortController();
    this.controller = abort;
    const previous = retry ? this.messages().slice(0, -2) : this.messages();
    const user: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: question,
      status: 'ok',
    };
    this.messages.set([...previous, user]);
    this.draft.set('');
    this.loading.set(true);
    this.shouldScroll = true;
    const history = previous
      .filter((m) => m.status === 'ok')
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 1200) }));
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          history,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
        signal: abort.signal,
      });
      if (!response.ok) throw new Error('Assistant indisponible');
      const result = (await response.json()) as {
        answer?: string;
        status?: string;
      };
      if (!result.answer?.trim()) throw new Error('Réponse vide');
      if (!abort.signal.aborted) {
        this.messages.update((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: result.answer!.trim(),
            status: result.status === 'ok' ? 'ok' : 'error',
          },
        ]);
      }
    } catch {
      if (!abort.signal.aborted) {
        this.messages.update((current) => [
          ...current,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content:
              "L'assistant est momentanément indisponible. Vous pouvez réessayer.",
            status: 'error',
          },
        ]);
      }
    } finally {
      if (!abort.signal.aborted) {
        this.loading.set(false);
        this.shouldScroll = true;
        this.persist();
      }
    }
  }

  reset(): void {
    this.controller?.abort();
    this.loading.set(false);
    this.messages.set([]);
    this.draft.set('');
    this.persist();
  }

  retryLast(): void {
    const msgs = this.messages();
    if (msgs.length >= 2 && msgs[msgs.length - 2]?.role === 'user') {
      void this.send(msgs[msgs.length - 2].content, true);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    void this.send(this.draft());
  }

  onKeyDown(event: KeyboardEvent): void {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.isComposing
    ) {
      event.preventDefault();
      void this.send(this.draft());
    }
  }

  asInput(event: Event): HTMLTextAreaElement {
    return event.target as HTMLTextAreaElement;
  }

  private persist(): void {
    try {
      sessionStorage.setItem(
        storageKey,
        JSON.stringify(this.messages().slice(-40))
      );
    } catch { /* An unavailable browser API must not block the page. */ }
  }

}
