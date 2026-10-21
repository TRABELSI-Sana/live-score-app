import { Component, inject, OnChanges, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../services/seo.service';
import { AdSlotComponent } from '../components/ads/ad-slot.component';
import { getBySlug } from '../content/articles';
import { getSiteBase } from '../utils/site-base';
import type { ContentItem } from '../models/content.model';

@Component({
  selector: 'app-article-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent],
  template: `
    <div class="site-container content-page">
      @if (!article) {
        <h1 class="content-page-title">Article introuvable</h1>
        <p>Cette page n'existe pas ou a ete deplacee.</p>
        <a routerLink="/news">Voir toutes les analyses →</a>
      } @else {
        <div class="content-page-header">
          <h1 class="content-page-title">{{ article.title }}</h1>
          <p class="content-page-desc">{{ article.description }}</p>
          <span class="content-page-meta">Mis a jour : {{ article.updatedAt }}</span>
        </div>
        <div class="page-grid">
          <div class="page-main">
            <div class="article-body" [innerHTML]="renderedBody"></div>
            <app-ad-slot variant="in-feed" slot="8567185183" />
          </div>
          <aside class="page-sidebar">
            <app-ad-slot variant="sidebar" slot="8567185183" />
            <div class="sidebar-card">
              <h3 class="sidebar-card-title">Articles</h3>
              <div class="sidebar-links">
                <a routerLink="/news" class="sidebar-link">Tous les articles</a>
                <a routerLink="/guides" class="sidebar-link">Guides</a>
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
export class ArticlePageComponent implements OnChanges {
  @Input() slug!: string;
  article: ContentItem | undefined;
  renderedBody = '';
  private seo = inject(SeoService);

  ngOnChanges(): void {
    this.article = this.slug ? getBySlug(this.slug) : undefined;
    if (!this.article) {
      this.renderedBody = '';
      this.seo.update({ title: 'Article introuvable', description: 'Le contenu demandé est introuvable.', path: `/news/${this.slug}`, noIndex: true });
      return;
    }
    if (this.article) {
      this.renderedBody = this.renderBody(this.article.body);
      const siteBase = getSiteBase();
      this.seo.update({
        title: this.article.title || 'Article',
        description: this.article.description || 'Analyse football sur LiveFoot',
        path: `/news/${this.article.slug}`,
        type: 'article',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: this.article.title,
          description: this.article.description,
          dateModified: this.article.updatedAt,
          datePublished: this.article.updatedAt,
          author: { '@type': 'Organization', name: 'LiveFoot' },
          publisher: { '@type': 'Organization', name: 'LiveFoot' },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteBase}/news/${this.article.slug}` },
        },
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
