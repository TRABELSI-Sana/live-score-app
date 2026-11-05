import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { AdSlotComponent } from '../../components/ads/ad-slot/ad-slot.component';
import { SeoFaqSectionComponent } from '../../components/seo-faq-section/seo-faq-section.component';
import { competitions } from '../../content/competitions';
import { competitionsFaqs } from '../../content/seo-faqs';
import { faqSchema, itemListSchema } from '../../utils/seo-schemas';
import { getSiteBase } from '../../utils/site-base';

@Component({
  selector: 'app-competitions-index-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent, SeoFaqSectionComponent],
  templateUrl: './competitions-index-page.component.html',
  styleUrl: './competitions-index-page.component.css',
})
export class CompetitionsIndexPageComponent implements OnInit {
  private seo = inject(SeoService);
  readonly competitions = competitions;
  readonly competitionsFaqs = competitionsFaqs;

  ngOnInit(): void {
    const siteBase = getSiteBase();
    this.seo.update({
      title: 'Competitions de football — Championnats, coupes et resultats',
      description:
        'Ligue 1, Premier League, Liga, Serie A, Bundesliga, Ligue des champions : format, classements, resultats en direct et enjeux sur LiveFoot.',
      path: '/competitions',
      jsonLd: [
        itemListSchema(siteBase, competitions, '/competitions'),
        faqSchema(competitionsFaqs),
      ],
    });
  }
}
