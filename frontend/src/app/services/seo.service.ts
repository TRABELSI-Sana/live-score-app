import { Injectable, inject, Renderer2, RendererFactory2 } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { getSiteBase, getAlternateSiteBase } from '../utils/site-base';

export interface SeoData {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  jsonLd?: object | object[];
  noIndex?: boolean;
  breadcrumbs?: { name: string; path: string }[];
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private titleService = inject(Title);
  private meta = inject(Meta);
  private doc = inject(DOCUMENT);
  private renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);

  update(data: SeoData): void {
    const base = getSiteBase();
    const alternate = getAlternateSiteBase();
    const url = `${base}${data.path}`;
    const altUrl = `${alternate}${data.path}`;
    const fullTitle = `${data.title} | LiveFoot`;
    const ogImage = `${base}/og-image.png`;
    const type = data.type ?? 'website';

    this.doc.documentElement.lang = base.endsWith('.tn') ? 'fr-TN' : 'fr';
    this.titleService.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: data.description });
    this.meta.updateTag({
      name: 'robots',
      content: data.noIndex ? 'noindex, follow' : 'index, follow',
    });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:image', content: ogImage });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:locale', content: 'fr_FR' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: data.description });
    this.meta.updateTag({ name: 'twitter:image', content: ogImage });

    this.updateLink('canonical', url);
    this.updateAlternateLinks(url, altUrl, base, data.path);
    this.clearJsonLd();

    if (data.jsonLd) {
      const schemas = Array.isArray(data.jsonLd) ? data.jsonLd : [data.jsonLd];
      schemas.forEach((schema) => this.addJsonLd(schema));
    }
    if (data.breadcrumbs && data.breadcrumbs.length > 0) {
      this.addJsonLd({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: data.breadcrumbs.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.name,
          item: `${base}${item.path}`,
        })),
      });
    }
  }

  private updateLink(rel: string, href: string): void {
    let link = this.doc.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!link) {
      link = this.renderer.createElement('link');
      this.renderer.setAttribute(link, 'rel', rel);
      this.renderer.appendChild(this.doc.head, link);
    }
    this.renderer.setAttribute(link, 'href', href);
  }

  private updateAlternateLinks(url: string, altUrl: string, base: string, path: string): void {
    const existingAlts = this.doc.querySelectorAll('link[rel="alternate"]');
    existingAlts.forEach((el) => el.remove());

    const frLang = base.endsWith('.online') ? 'fr' : 'fr-TN';
    const altLang = base.endsWith('.online') ? 'fr-TN' : 'fr';

    this.addAlternateLink(url, frLang);
    this.addAlternateLink(altUrl, altLang);
    this.addAlternateLink(`https://livefoot.online${path}`, 'x-default');
  }

  private addAlternateLink(href: string, hreflang: string): void {
    const link = this.renderer.createElement('link');
    this.renderer.setAttribute(link, 'rel', 'alternate');
    this.renderer.setAttribute(link, 'href', href);
    this.renderer.setAttribute(link, 'hreflang', hreflang);
    this.renderer.appendChild(this.doc.head, link);
  }

  private clearJsonLd(): void {
    this.doc.querySelectorAll('script[type="application/ld+json"]').forEach((el) => el.remove());
  }

  private addJsonLd(schema: object): void {
    const script = this.renderer.createElement('script');
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    script.textContent = JSON.stringify(schema);
    this.renderer.appendChild(this.doc.head, script);
  }
}
