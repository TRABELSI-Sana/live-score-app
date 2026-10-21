import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { LiveBoardComponent } from '../../components/live/live-board/live-board.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { SeoFaqSectionComponent } from '../../components/seo-faq-section/seo-faq-section.component';
import { liveFaqs } from '../../content/seo-faqs';
import { faqSchema } from '../../utils/seo-schemas';
import { getSiteBase } from '../../utils/site-base';

@Component({
  selector: 'app-live-page',
  standalone: true,
  imports: [LiveBoardComponent, SidebarComponent, SeoFaqSectionComponent],
  templateUrl: './live-page.component.html',
  styleUrl: './live-page.component.css',
})
export class LivePageComponent implements OnInit {
  private seo = inject(SeoService);
  readonly liveFaqs = liveFaqs;

  ngOnInit(): void {
    const siteBase = getSiteBase();
    this.seo.update({
      title: 'Matchs en direct',
      description:
        "Tous les matchs de football en direct aujourd'hui. Scores, buts, cartons et evenements mis a jour toutes les 60 secondes.",
      path: '/en-direct',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Matchs de football en direct',
          url: `${siteBase}/en-direct`,
          inLanguage: 'fr',
          description: 'Scores, statuts et evenements des matchs de football en direct.',
        },
        faqSchema(liveFaqs),
      ],
    });
  }
}
