import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="footer-inner">
        <div>
          <div class="footer-brand">LiveFoot</div>
          <p class="footer-desc">
            Scores de football en direct, resultats, classements et analyses.
            Service gratuit finance par la publicite.
          </p>
        </div>
        <div>
          <div class="footer-heading">Navigation</div>
          <div class="footer-links">
            <a routerLink="/" class="footer-link">Accueil</a>
            <a routerLink="/en-direct" class="footer-link">En direct</a>
            <a routerLink="/guides" class="footer-link">Guides</a>
            <a routerLink="/news" class="footer-link">Actualites</a>
            <a routerLink="/teams" class="footer-link">Equipes</a>
            <a routerLink="/competitions" class="footer-link">Competitions</a>
          </div>
        </div>
        <div>
          <div class="footer-heading">Legal</div>
          <div class="footer-links">
            <a href="/privacy.html" class="footer-link">Confidentialite</a>
            <a href="/terms.html" class="footer-link">Conditions d'utilisation</a>
            <a href="/about.html" class="footer-link">A propos</a>
            <a href="/contact.html" class="footer-link">Contact</a>
          </div>
        </div>
        <div>
          <div class="footer-heading">Publicite</div>
          <div class="footer-links">
            <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer" class="footer-link">Politique Google Ads</a>
            <a href="https://adssettings.google.com/" target="_blank" rel="noopener noreferrer" class="footer-link">Parametres des annonces</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2025-2026 LiveFoot — Tous droits reserves.</span>
        <span>livefoot.tn / livefoot.online</span>
      </div>
    </footer>
  `,
})
export class FooterComponent {}
