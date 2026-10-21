import {
  Component,
  Input,
  afterRenderEffect,
  inject,
} from '@angular/core';
import { CookieConsentService } from '../../services/cookie-consent.service';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

@Component({
  selector: 'app-ad-slot',
  standalone: true,
  template: `
    @if (consentService.consent() === 'accepted') {
      <div [class]="'ad-slot ad-slot--' + variant">
        <span class="ad-slot-label">Publicite</span>
        <ins
          class="adsbygoogle"
          style="display: block"
          data-ad-client="ca-pub-6754395387524937"
          [attr.data-ad-slot]="slot"
          [attr.data-ad-format]="variant === 'in-feed' ? 'fluid' : 'auto'"
          data-full-width-responsive="true"
        ></ins>
      </div>
    }
  `,
})
export class AdSlotComponent {
  @Input({ required: true }) variant!:
    | 'leaderboard'
    | 'rectangle'
    | 'in-feed'
    | 'sidebar';
  @Input({ required: true }) slot!: string;

  readonly consentService = inject(CookieConsentService);
  private pushed = false;

  private readonly adEffect = afterRenderEffect(() => {
    if (this.consentService.consent() !== 'accepted' || this.pushed) return;
    this.pushed = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch { /* An unavailable ad provider must not block the page. */ }
  });
}
