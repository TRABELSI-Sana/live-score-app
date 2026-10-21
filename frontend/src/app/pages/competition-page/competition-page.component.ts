import { Component, inject, OnChanges, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { AdSlotComponent } from '../../components/ads/ad-slot/ad-slot.component';
import { getBySlug } from '../../content/competitions';
import { getSiteBase } from '../../utils/site-base';
import type { ContentItem } from '../../models/content.model';
import { renderContent } from '../../utils/render-content';

@Component({
  selector: 'app-competition-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent],
  templateUrl: './competition-page.component.html',
  styleUrl: './competition-page.component.css',
})
export class CompetitionPageComponent implements OnChanges {
  @Input() slug!: string;
  comp: ContentItem | undefined;
  renderedBody = '';
  private seo = inject(SeoService);

  ngOnChanges(): void {
    this.comp = this.slug ? getBySlug(this.slug) : undefined;
    if (!this.comp) {
      this.renderedBody = '';
      this.seo.update({
        title: 'Compétition introuvable',
        description: 'Le contenu demandé est introuvable.',
        path: `/competitions/${this.slug}`,
        noIndex: true,
      });
      return;
    }
    this.renderedBody = renderContent(this.comp.body);
    const siteBase = getSiteBase();
    this.seo.update({
      title: `${this.comp.name} – Resultats en direct`,
      description:
        this.comp.description ||
        `Suivez ${this.comp.name} en direct : classement, resultats, calendrier et statistiques sur LiveFoot.`,
      path: `/competitions/${this.comp.slug}`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SportsOrganization',
        name: this.comp.name,
        sport: 'Soccer',
        url: `${siteBase}/competitions/${this.comp.slug}`,
        description: this.comp.description || `Suivez ${this.comp.name} en direct sur LiveFoot`,
      },
      breadcrumbs: [
        { name: 'Accueil', path: '/' },
        { name: 'Competitions', path: '/competitions' },
        { name: this.comp.name ?? 'Competition', path: `/competitions/${this.comp.slug}` },
      ],
    });
  }
}
