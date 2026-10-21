import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../services/seo.service';
import { AdSlotComponent } from '../components/ads/ad-slot.component';
import { SeoFaqSectionComponent } from '../components/seo-faq-section.component';
import { competitions } from '../content/competitions';
import { competitionsFaqs } from '../content/seo-faqs';
import { faqSchema, itemListSchema } from '../utils/seo-schemas';
import { getSiteBase } from '../utils/site-base';

@Component({
  selector: 'app-competitions-index-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent, SeoFaqSectionComponent],
  template: `
    <div class="site-container content-page">
      <div class="content-page-header">
        <h1 class="content-page-title">Competitions de football</h1>
        <p class="content-page-desc">
          Format, enjeux et classements des principales competitions couvertes par LiveFoot.
        </p>
      </div>
      <div class="page-grid">
        <div class="page-main">
          <div class="content-grid">
            @for (c of competitions; track c.slug) {
              <article class="content-card">
                <h2 class="content-card-title">{{ c.name }}</h2>
                <p class="content-card-desc">{{ c.description }}</p>
                <span class="content-card-meta">Mis a jour : {{ c.updatedAt }}</span>
                <a [routerLink]="'/competitions/' + c.slug" class="content-card-link">Voir la competition →</a>
              </article>
            }
          </div>
          <app-seo-faq-section [faqs]="competitionsFaqs" />
        </div>
        <aside class="page-sidebar">
          <app-ad-slot variant="sidebar" slot="8567185183" />
          <div class="sidebar-card">
            <h3 class="sidebar-card-title">Explorer</h3>
            <div class="sidebar-links">
              <a routerLink="/teams" class="sidebar-link">Equipes</a>
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
export class CompetitionsIndexPageComponent implements OnInit {
  private seo = inject(SeoService);
  readonly competitions = competitions;
  readonly competitionsFaqs = competitionsFaqs;

  ngOnInit(): void {
    const siteBase = getSiteBase();
    this.seo.update({
      title: 'Competitions de football',
      description: 'Toutes les competitions couvertes par LiveFoot : Ligue 1, Premier League, Liga, Serie A, Champions League. Format, enjeux et classements.',
      path: '/competitions',
      jsonLd: [itemListSchema(siteBase, competitions, '/competitions'), faqSchema(competitionsFaqs)],
    });
  }
}
