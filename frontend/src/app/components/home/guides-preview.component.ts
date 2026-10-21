import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { guides } from '../../content/guides';

@Component({
  selector: 'app-guides-preview',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section style="margin-top: var(--space-xl)">
      <div class="section-header">
        <h2 class="section-title">Guides populaires</h2>
        <a routerLink="/guides" class="section-link">Tous les guides →</a>
      </div>
      <div class="editorial-grid">
        @for (guide of featured; track guide.slug) {
          <article class="editorial-card">
            <div class="editorial-card-tag">Guide</div>
            <h3 class="editorial-card-title">{{ guide.title }}</h3>
            <p class="editorial-card-desc">{{ guide.description }}</p>
            <a [routerLink]="'/guides/' + guide.slug" class="editorial-card-link">Lire le guide →</a>
          </article>
        }
      </div>
    </section>
  `,
})
export class GuidesPreviewComponent {
  readonly featured = guides.slice(0, 3);
}
