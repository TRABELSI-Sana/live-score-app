import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { AdSlotComponent } from '../../components/ads/ad-slot/ad-slot.component';
import { SeoFaqSectionComponent } from '../../components/seo-faq-section/seo-faq-section.component';
import { teams } from '../../content/teams';
import { teamsFaqs } from '../../content/seo-faqs';
import { faqSchema, itemListSchema } from '../../utils/seo-schemas';
import { getSiteBase } from '../../utils/site-base';

@Component({
  selector: 'app-teams-index-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent, SeoFaqSectionComponent],
  templateUrl: './teams-index-page.component.html',
  styleUrl: './teams-index-page.component.css',
})
export class TeamsIndexPageComponent implements OnInit {
  private seo = inject(SeoService);
  readonly teams = teams;
  readonly teamsFaqs = teamsFaqs;

  ngOnInit(): void {
    const siteBase = getSiteBase();
    this.seo.update({
      title: 'Equipes de football',
      description:
        'Decouvrez les clubs et equipes couverts par LiveFoot : historique, palmares, statistiques et resultats en direct.',
      path: '/teams',
      jsonLd: [itemListSchema(siteBase, teams, '/teams'), faqSchema(teamsFaqs)],
    });
  }
}
