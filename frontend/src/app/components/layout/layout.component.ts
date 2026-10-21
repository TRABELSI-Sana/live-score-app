import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar.component';
import { FooterComponent } from './footer.component';
import { AdSlotComponent } from '../ads/ad-slot.component';
import { CookieConsentComponent } from '../cookie-consent.component';
import { CookieConsentService } from '../../services/cookie-consent.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    AdSlotComponent,
    CookieConsentComponent,
  ],
  template: `
    <div class="site-wrapper">
      <app-navbar />
      <app-ad-slot variant="leaderboard" slot="8567185183" />
      <main>
        <router-outlet />
      </main>
      <app-ad-slot variant="leaderboard" slot="8567185183" />
      <app-footer />
      <app-cookie-consent />
    </div>
  `,
})
export class LayoutComponent implements OnInit {
  private cookieService = inject(CookieConsentService);

  ngOnInit(): void {
    this.cookieService.initAdsIfAccepted();
  }
}
