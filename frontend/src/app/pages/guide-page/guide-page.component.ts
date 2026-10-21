import { Component, inject, OnChanges, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { AdSlotComponent } from '../../components/ads/ad-slot/ad-slot.component';
import { getGuideBySlug } from '../../content/guides';
import { getSiteBase } from '../../utils/site-base';
import type { Guide } from '../../models/content.model';
import { renderContent } from '../../utils/render-content';

@Component({
  selector: 'app-guide-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent],
  templateUrl: './guide-page.component.html',
  styleUrl: './guide-page.component.css',
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
      this.seo.update({
        title: 'Guide introuvable',
        description: 'Le contenu demandé est introuvable.',
        path: `/guides/${this.slug}`,
        noIndex: true,
      });
      return;
    }
    this.renderedBody = renderContent(this.guide.body);
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
