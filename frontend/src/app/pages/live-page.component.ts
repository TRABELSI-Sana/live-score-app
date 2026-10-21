import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../services/seo.service';
import { LiveBoardComponent } from '../components/live/live-board.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { SeoFaqSectionComponent } from '../components/seo-faq-section.component';
import { liveFaqs } from '../content/seo-faqs';
import { faqSchema } from '../utils/seo-schemas';
import { getSiteBase } from '../utils/site-base';

@Component({
  selector: 'app-live-page',
  standalone: true,
  imports: [LiveBoardComponent, SidebarComponent, SeoFaqSectionComponent],
  template: `
    <div class="site-container">
      <div class="content-page-header">
        <h1 class="content-page-title">Matchs en direct</h1>
        <p class="content-page-desc">
          Tous les scores de football en temps reel. Mis a jour toutes les 60 secondes.
        </p>
      </div>
      <div class="page-grid">
        <div class="page-main">
          <app-live-board />
          <app-seo-faq-section [faqs]="liveFaqs" />
        </div>
        <app-sidebar />
      </div>
    </div>
  `,
})
export class LivePageComponent implements OnInit {
  private seo = inject(SeoService);
  readonly liveFaqs = liveFaqs;

  ngOnInit(): void {
    const siteBase = getSiteBase();
    this.seo.update({
      title: 'Matchs en direct',
      description:
        'Tous les matchs de football en direct aujourd\'hui. Scores, buts, cartons et evenements mis a jour toutes les 60 secondes.',
      path: '/en-direct',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Matchs de football en direct',
          url: `${siteBase}/en-direct`,
          inLanguage: 'fr',
          description:
            'Scores, statuts et evenements des matchs de football en direct.',
        },
        faqSchema(liveFaqs),
      ],
    });
  }
}
