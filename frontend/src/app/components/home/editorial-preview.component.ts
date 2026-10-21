import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { articles } from '../../content/articles';

@Component({
  selector: 'app-editorial-preview',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section style="margin-top: var(--space-xl)">
      <div class="section-header">
        <h2 class="section-title">A la une</h2>
        <a routerLink="/news" class="section-link">Voir tout →</a>
      </div>
      <div class="editorial-grid">
        @for (article of latest; track article.slug) {
          <article class="editorial-card">
            <div class="editorial-card-tag">Article</div>
            <h3 class="editorial-card-title">{{ article.title }}</h3>
            <p class="editorial-card-desc">{{ article.description }}</p>
            <a [routerLink]="'/news/' + article.slug" class="editorial-card-link">Lire →</a>
          </article>
        }
      </div>
    </section>
  `,
})
export class EditorialPreviewComponent {
  readonly latest = articles.slice(0, 3);
}
