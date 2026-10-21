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
  templateUrl: './quick-links-card.component.html',
  styleUrl: './quick-links-card.component.css',
})
export class QuickLinksCardComponent {
  readonly links = LINKS;
  readonly legalLinks = LEGAL_LINKS;
}
