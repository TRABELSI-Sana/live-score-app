import { Component, inject, OnChanges, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../services/seo.service';
import { AdSlotComponent } from '../components/ads/ad-slot.component';
import { getBySlug } from '../content/competitions';
import { getSiteBase } from '../utils/site-base';
import type { ContentItem } from '../models/content.model';

@Component({
  selector: 'app-competition-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent],
  template: `
    <div class="site-container content-page">
      @if (!comp) {
        <h1 class="content-page-title">Competition introuvable</h1>
        <p>La page demandee n'existe pas ou a ete deplacee.</p>
        <a routerLink="/competitions">Voir toutes les competitions →</a>
      } @else {
        <div class="content-page-header">
          <h1 class="content-page-title">{{ comp.name }}</h1>
          <p class="content-page-desc">{{ comp.description }}</p>
          <span class="content-page-meta">Mis a jour : {{ comp.updatedAt }}</span>
        </div>
        <div class="page-grid">
          <div class="page-main">
            <div class="article-body" [innerHTML]="renderedBody"></div>
            <app-ad-slot variant="in-feed" slot="8567185183" />
          </div>
          <aside class="page-sidebar">
            <app-ad-slot variant="sidebar" slot="8567185183" />
            <div class="sidebar-card">
              <h3 class="sidebar-card-title">Competitions</h3>
              <div class="sidebar-links">
                <a routerLink="/competitions" class="sidebar-link">Toutes les competitions</a>
                <a routerLink="/teams" class="sidebar-link">Equipes</a>
                <a routerLink="/en-direct" class="sidebar-link">Scores en direct</a>
              </div>
            </div>
            <app-ad-slot variant="sidebar" slot="8567185183" />
          </aside>
        </div>
      }
    </div>
  `,
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
      this.seo.update({ title: 'Compétition introuvable', description: 'Le contenu demandé est introuvable.', path: `/competitions/${this.slug}`, noIndex: true });
      return;
    }
    if (this.comp) {
      this.renderedBody = this.renderBody(this.comp.body);
      const siteBase = getSiteBase();
      this.seo.update({
        title: `${this.comp.name} – Resultats en direct`,
        description: this.comp.description || `Suivez ${this.comp.name} en direct : classement, resultats, calendrier et statistiques sur LiveFoot.`,
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

  private renderBody(body: string): string {
    return body.split(/\n\n+/).map(b => b.trim()).filter(Boolean).map(block => {
      if (block.startsWith('### ')) return `<h3>${this.escapeHtml(block.slice(4))}</h3>`;
      if (block.startsWith('## ')) return `<h2>${this.escapeHtml(block.slice(3))}</h2>`;
      if (block.startsWith('# ')) return `<h1>${this.escapeHtml(block.slice(2))}</h1>`;
      return `<p>${this.escapeHtml(block)}</p>`;
    }).join('');
  }

  private escapeHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
