import { Component, inject } from '@angular/core';
import { CookieConsentService } from '../services/cookie-consent.service';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  template: `
    @if (cookieService.consent() === null) {
      <div class="cookie-consent" role="dialog" aria-label="Consentement aux cookies">
        <div class="cookie-consent-inner">
          <div class="cookie-consent-text">
            <p class="cookie-consent-title">Nous respectons votre vie privee</p>
            <p>
              LiveFoot utilise des cookies publicitaires (Google AdSense) pour financer ce service gratuit.
              Aucun cookie publicitaire n'est depose sans votre accord.
            </p>
            <p class="cookie-consent-links">
              <a href="/privacy.html">Politique de confidentialite</a>
              ·
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
                Comment Google utilise vos donnees
              </a>
            </p>
          </div>
          <div class="cookie-consent-actions">
            <button type="button" class="cookie-btn cookie-btn--accept" (click)="cookieService.accept()">
              Accepter
            </button>
            <button type="button" class="cookie-btn cookie-btn--refuse" (click)="cookieService.refuse()">
              Refuser
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CookieConsentComponent {
  readonly cookieService = inject(CookieConsentService);
}
