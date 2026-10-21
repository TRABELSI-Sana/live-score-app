import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../services/seo.service';
import { AdSlotComponent } from '../components/ads/ad-slot.component';
import { SeoFaqSectionComponent } from '../components/seo-faq-section.component';
import { teams } from '../content/teams';
import { teamsFaqs } from '../content/seo-faqs';
import { faqSchema, itemListSchema } from '../utils/seo-schemas';
import { getSiteBase } from '../utils/site-base';

@Component({
  selector: 'app-teams-index-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent, SeoFaqSectionComponent],
  template: `
    <div class="site-container content-page">
      <div class="content-page-header">
        <h1 class="content-page-title">Equipes de football</h1>
        <p class="content-page-desc">
          Decouvrez les clubs et equipes couverts par LiveFoot : historique, palmares et actualites.
        </p>
      </div>
      <div class="page-grid">
        <div class="page-main">
          <div class="content-grid">
            @for (t of teams; track t.slug) {
              <article class="content-card">
                <h2 class="content-card-title">{{ t.name }}</h2>
                <p class="content-card-desc">{{ t.description }}</p>
                <span class="content-card-meta">Mis a jour : {{ t.updatedAt }}</span>
                <a [routerLink]="'/teams/' + t.slug" class="content-card-link">Voir l'equipe →</a>
              </article>
            }
          </div>
          <app-seo-faq-section [faqs]="teamsFaqs" />
        </div>
        <aside class="page-sidebar">
          <app-ad-slot variant="sidebar" slot="8567185183" />
          <div class="sidebar-card">
            <h3 class="sidebar-card-title">Explorer</h3>
            <div class="sidebar-links">
              <a routerLink="/competitions" class="sidebar-link">Competitions</a>
              <a routerLink="/news" class="sidebar-link">Articles</a>
              <a routerLink="/guides" class="sidebar-link">Guides</a>
              <a routerLink="/en-direct" class="sidebar-link">Scores en direct</a>
            </div>
          </div>
          <app-ad-slot variant="sidebar" slot="8567185183" />
        </aside>
      </div>
    </div>
  `,
})
export class TeamsIndexPageComponent implements OnInit {
  private seo = inject(SeoService);
  readonly teams = teams;
  readonly teamsFaqs = teamsFaqs;

  ngOnInit(): void {
    const siteBase = getSiteBase();
    this.seo.update({
      title: 'Equipes de football',
      description: 'Decouvrez les clubs et equipes couverts par LiveFoot : historique, palmares, statistiques et resultats en direct.',
      path: '/teams',
      jsonLd: [itemListSchema(siteBase, teams, '/teams'), faqSchema(teamsFaqs)],
    });
  }
}
