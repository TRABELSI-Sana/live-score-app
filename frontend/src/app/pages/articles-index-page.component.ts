import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../services/seo.service';
import { AdSlotComponent } from '../components/ads/ad-slot.component';
import { articles } from '../content/articles';

@Component({
  selector: 'app-articles-index-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent],
  template: `
    <div class="site-container content-page">
      <div class="content-page-header">
        <h1 class="content-page-title">Actualites &amp; analyses</h1>
        <p class="content-page-desc">
          Contenu editorial original pour comprendre les scores, les stats et les tendances du football.
        </p>
      </div>
      <div class="page-grid">
        <div class="page-main">
          <div class="content-grid">
            @for (a of articles; track a.slug) {
              <article class="content-card">
                <h2 class="content-card-title">{{ a.title }}</h2>
                <p class="content-card-desc">{{ a.description }}</p>
                <span class="content-card-meta">Mis a jour : {{ a.updatedAt }}</span>
                <a [routerLink]="'/news/' + a.slug" class="content-card-link">Lire l'article →</a>
              </article>
            }
          </div>
        </div>
        <aside class="page-sidebar">
          <app-ad-slot variant="sidebar" slot="8567185183" />
          <div class="sidebar-card">
            <h3 class="sidebar-card-title">Explorer</h3>
            <div class="sidebar-links">
              <a routerLink="/guides" class="sidebar-link">Guides</a>
              <a routerLink="/teams" class="sidebar-link">Equipes</a>
              <a routerLink="/competitions" class="sidebar-link">Competitions</a>
              <a routerLink="/en-direct" class="sidebar-link">Scores en direct</a>
            </div>
          </div>
          <app-ad-slot variant="sidebar" slot="8567185183" />
        </aside>
      </div>
    </div>
  `,
})
export class ArticlesIndexPageComponent implements OnInit {
  private seo = inject(SeoService);
  readonly articles = articles;

  ngOnInit(): void {
    this.seo.update({
      title: 'Actualites et analyses football',
      description: 'Articles editoriaux pour comprendre les scores, les statistiques et les tendances du football. Analyses tactiques et decryptages.',
      path: '/news',
    });
  }
}
