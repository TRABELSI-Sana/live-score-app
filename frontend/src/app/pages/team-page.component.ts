import { Component, inject, OnChanges, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../services/seo.service';
import { AdSlotComponent } from '../components/ads/ad-slot.component';
import { getBySlug } from '../content/teams';
import { getSiteBase } from '../utils/site-base';
import type { ContentItem } from '../models/content.model';

@Component({
  selector: 'app-team-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent],
  template: `
    <div class="site-container content-page">
      @if (!team) {
        <h1 class="content-page-title">Equipe introuvable</h1>
        <p>La page demandee n'existe pas ou a ete deplacee.</p>
        <a routerLink="/teams">Voir toutes les equipes →</a>
      } @else {
        <div class="content-page-header">
          <h1 class="content-page-title">{{ team.name }}</h1>
          <p class="content-page-desc">{{ team.description }}</p>
          <span class="content-page-meta">Mis a jour : {{ team.updatedAt }}</span>
        </div>
        <div class="page-grid">
          <div class="page-main">
            <div class="article-body" [innerHTML]="renderedBody"></div>
            <app-ad-slot variant="in-feed" slot="8567185183" />
          </div>
          <aside class="page-sidebar">
            <app-ad-slot variant="sidebar" slot="8567185183" />
            <div class="sidebar-card">
              <h3 class="sidebar-card-title">Equipes</h3>
              <div class="sidebar-links">
                <a routerLink="/teams" class="sidebar-link">Toutes les equipes</a>
                <a routerLink="/competitions" class="sidebar-link">Competitions</a>
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
export class TeamPageComponent implements OnChanges {
  @Input() slug!: string;
  team: ContentItem | undefined;
  renderedBody = '';
  private seo = inject(SeoService);

  ngOnChanges(): void {
    this.team = this.slug ? getBySlug(this.slug) : undefined;
    if (!this.team) {
      this.renderedBody = '';
      this.seo.update({ title: 'Équipe introuvable', description: 'Le contenu demandé est introuvable.', path: `/teams/${this.slug}`, noIndex: true });
      return;
    }
    if (this.team) {
      this.renderedBody = this.renderBody(this.team.body);
      const siteBase = getSiteBase();
      this.seo.update({
        title: `${this.team.name} – Resultats et infos`,
        description: this.team.description || `Suivez ${this.team.name} en direct : resultats, statistiques, analyse et historique sur LiveFoot.`,
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
