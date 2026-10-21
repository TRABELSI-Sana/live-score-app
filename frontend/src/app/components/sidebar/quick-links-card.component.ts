import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

const LINKS = [
  { to: '/en-direct', label: 'Scores en direct' },
  { to: '/guides', label: 'Guides football' },
  { to: '/news', label: 'Actualites & analyses' },
  { to: '/teams', label: 'Equipes' },
  { to: '/competitions', label: 'Competitions' },
];

const LEGAL_LINKS = [
  { href: '/about.html', label: 'A propos' },
  { href: '/privacy.html', label: 'Confidentialite' },
  { href: '/terms.html', label: 'Conditions' },
  { href: '/contact.html', label: 'Contact' },
];

@Component({
  selector: 'app-quick-links-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="sidebar-card">
      <h3 class="sidebar-card-title">Acces rapide</h3>
      <div class="sidebar-links">
        @for (link of links; track link.to) {
          <a [routerLink]="link.to" class="sidebar-link">{{ link.label }}</a>
        }
      </div>
      <div class="sidebar-links" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--color-border-light)">
        @for (link of legalLinks; track link.href) {
          <a [href]="link.href" class="sidebar-link">{{ link.label }}</a>
        }
      </div>
    </div>
  `,
})
export class QuickLinksCardComponent {
  readonly links = LINKS;
  readonly legalLinks = LEGAL_LINKS;
}
