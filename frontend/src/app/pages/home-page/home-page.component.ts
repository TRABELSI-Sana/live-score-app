import { Component, inject, OnInit } from '@angular/core';
import { SeoService } from '../../services/seo.service';
import { HeroSectionComponent } from '../../components/home/hero-section/hero-section.component';
import { LiveBoardComponent } from '../../components/live/live-board/live-board.component';
import { EditorialPreviewComponent } from '../../components/home/editorial-preview/editorial-preview.component';
import { GuidesPreviewComponent } from '../../components/home/guides-preview/guides-preview.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { AdSlotComponent } from '../../components/ads/ad-slot/ad-slot.component';
import { SeoFaqSectionComponent } from '../../components/seo-faq-section/seo-faq-section.component';
import { homeFaqs } from '../../content/seo-faqs';
import { faqSchema, organizationSchema } from '../../utils/seo-schemas';
import { getSiteBase } from '../../utils/site-base';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    HeroSectionComponent,
    LiveBoardComponent,
    EditorialPreviewComponent,
    GuidesPreviewComponent,
    SidebarComponent,
    AdSlotComponent,
    SeoFaqSectionComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit {
  private seo = inject(SeoService);
  readonly homeFaqs = homeFaqs;

  ngOnInit(): void {
    const siteBase = getSiteBase();
    this.seo.update({
      title: 'Scores en direct de football',
      description:
        'Suivez tous les scores de football en direct : Ligue 1, Premier League, Liga, Serie A, Champions League. Resultats, buts et evenements en temps reel.',
      path: '/',
      jsonLd: [
        organizationSchema(siteBase),
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'LiveFoot',
          url: `${siteBase}/`,
          inLanguage: 'fr',
          description: 'Scores en direct de football, resultats et evenements cles des matchs.',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${siteBase}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
        faqSchema(homeFaqs),
      ],
    });
  }
}
