import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './navbar/navbar.component';
import { FooterComponent } from './footer/footer.component';
import { AdSlotComponent } from '../ads/ad-slot/ad-slot.component';
import { CookieConsentComponent } from '../cookie-consent/cookie-consent.component';
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
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent implements OnInit {
  private cookieService = inject(CookieConsentService);

  ngOnInit(): void {
    this.cookieService.initAdsIfAccepted();
  }
}
