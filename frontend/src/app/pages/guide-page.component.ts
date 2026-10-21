import { Component, inject, OnChanges, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../services/seo.service';
import { AdSlotComponent } from '../components/ads/ad-slot.component';
import { getGuideBySlug } from '../content/guides';
import { getSiteBase } from '../utils/site-base';
import type { Guide } from '../models/content.model';

@Component({
  selector: 'app-guide-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent],
  template: `
    <div class="site-container content-page">
      @if (!guide) {
        <h1 class="content-page-title">Guide introuvable</h1>
        <p>Le contenu demande n'existe pas ou a ete deplace.</p>
        <a routerLink="/guides">Voir tous les guides →</a>
      } @else {
        <div class="content-page-header">
          <h1 class="content-page-title">{{ guide.title }}</h1>
          <p class="content-page-desc">{{ guide.description }}</p>
          <span class="content-page-meta">Mis a jour : {{ guide.updatedAt }}</span>
        </div>
        <div class="page-grid">
          <div class="page-main">
            <div class="article-body" [innerHTML]="renderedBody"></div>
            <app-ad-slot variant="in-feed" slot="8567185183" />
          </div>
          <aside class="page-sidebar">
            <app-ad-slot variant="sidebar" slot="8567185183" />
            <div class="sidebar-card">
              <h3 class="sidebar-card-title">Guides</h3>
              <div class="sidebar-links">
                <a routerLink="/guides" class="sidebar-link">Tous les guides</a>
                <a routerLink="/news" class="sidebar-link">Articles</a>
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
export class GuidePageComponent implements OnChanges {
  @Input() slug!: string;
  guide: Guide | undefined;
  renderedBody = '';
  private seo = inject(SeoService);

  ngOnChanges(): void {
    this.guide = this.slug ? getGuideBySlug(this.slug) : undefined;
    if (!this.guide) {
      this.renderedBody = '';
      this.seo.update({ title: 'Guide introuvable', description: 'Le contenu demandé est introuvable.', path: `/guides/${this.slug}`, noIndex: true });
      return;
    }
    if (this.guide) {
      this.renderedBody = this.renderBody(this.guide.body);
      const siteBase = getSiteBase();
      this.seo.update({
        title: this.guide.title,
        description: this.guide.description,
        path: `/guides/${this.guide.slug}`,
        type: 'article',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: this.guide.title,
          description: this.guide.description,
          dateModified: this.guide.updatedAt,
          datePublished: this.guide.updatedAt,
          author: { '@type': 'Organization', name: 'LiveFoot' },
          publisher: { '@type': 'Organization', name: 'LiveFoot' },
          mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteBase}/guides/${this.guide.slug}` },
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
