import { Component, Input, afterRenderEffect, inject } from '@angular/core';
import { CookieConsentService } from '../../../services/cookie-consent.service';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

@Component({
  selector: 'app-ad-slot',
  standalone: true,
  templateUrl: './ad-slot.component.html',
  styleUrl: './ad-slot.component.css',
})
export class AdSlotComponent {
  @Input({ required: true }) variant!: 'leaderboard' | 'rectangle' | 'in-feed' | 'sidebar';
  @Input({ required: true }) slot!: string;

  readonly consentService = inject(CookieConsentService);
  private pushed = false;

  private readonly adEffect = afterRenderEffect(() => {
    if (this.consentService.consent() !== 'accepted' || this.pushed) return;
    this.pushed = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* An unavailable ad provider must not block the page. */
    }
  });
}
