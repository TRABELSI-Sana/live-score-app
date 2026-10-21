import { Component, inject, OnChanges, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { AdSlotComponent } from '../../components/ads/ad-slot/ad-slot.component';
import { getBySlug } from '../../content/articles';
import { getSiteBase } from '../../utils/site-base';
import type { ContentItem } from '../../models/content.model';
import { renderContent } from '../../utils/render-content';

@Component({
  selector: 'app-article-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent],
  templateUrl: './article-page.component.html',
  styleUrl: './article-page.component.css',
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
      this.seo.update({
        title: 'Article introuvable',
        description: 'Le contenu demandé est introuvable.',
        path: `/news/${this.slug}`,
        noIndex: true,
      });
      return;
    }
    this.renderedBody = renderContent(this.article.body);
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
