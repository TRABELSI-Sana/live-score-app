import { Component, inject } from '@angular/core';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  templateUrl: './cookie-consent.component.html',
  styleUrl: './cookie-consent.component.css',
})
export class CookieConsentComponent {
  readonly cookieService = inject(CookieConsentService);
}
