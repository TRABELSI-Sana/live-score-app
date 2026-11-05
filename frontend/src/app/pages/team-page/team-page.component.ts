import { Component, inject, OnChanges, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { AdSlotComponent } from '../../components/ads/ad-slot/ad-slot.component';
import { BreadcrumbComponent } from '../../components/breadcrumb/breadcrumb.component';
import { RelatedContentComponent } from '../../components/related-content/related-content.component';
import { getRelatedForTeam, type RelatedLink } from '../../utils/related-content';
import { getBySlug } from '../../content/teams';
import { getSiteBase } from '../../utils/site-base';
import type { ContentItem } from '../../models/content.model';
import { renderContent } from '../../utils/render-content';

@Component({
  selector: 'app-team-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent, BreadcrumbComponent, RelatedContentComponent],
  templateUrl: './team-page.component.html',
  styleUrl: './team-page.component.css',
})
export class TeamPageComponent implements OnChanges {
  @Input() slug!: string;
  team: ContentItem | undefined;
  renderedBody = '';
  relatedLinks: RelatedLink[] = [];
  private seo = inject(SeoService);

  ngOnChanges(): void {
    this.team = this.slug ? getBySlug(this.slug) : undefined;
    if (!this.team) {
      this.renderedBody = '';
      this.seo.update({
        title: 'Équipe introuvable',
        description: 'Le contenu demandé est introuvable.',
        path: `/teams/${this.slug}`,
        noIndex: true,
      });
      return;
    }
    this.renderedBody = renderContent(this.team.body);
    this.relatedLinks = getRelatedForTeam(this.slug);
    const siteBase = getSiteBase();
    this.seo.update({
      title: `${this.team.name} — Scores en direct, resultats et actualites`,
      description:
        this.team.description ||
        `Suivez ${this.team.name} en direct : resultats, statistiques, analyse et historique sur LiveFoot.`,
      path: `/teams/${this.team.slug}`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SportsTeam',
        name: this.team.name,
        sport: 'Soccer',
        url: `${siteBase}/teams/${this.team.slug}`,
        description: this.team.description || `Suivez ${this.team.name} en direct sur LiveFoot`,
      },
      breadcrumbs: [
        { name: 'Accueil', path: '/' },
        { name: 'Equipes', path: '/teams' },
        { name: this.team.name ?? 'Equipe', path: `/teams/${this.team.slug}` },
      ],
    });
  }
}
