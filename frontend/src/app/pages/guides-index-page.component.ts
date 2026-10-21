import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../services/seo.service';
import { AdSlotComponent } from '../components/ads/ad-slot.component';
import { guides } from '../content/guides';

@Component({
  selector: 'app-guides-index-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent],
  template: `
    <div class="site-container content-page">
      <div class="content-page-header">
        <h1 class="content-page-title">Guides football</h1>
        <p class="content-page-desc">
          Guides editoriaux pour comprendre les regles, tactiques, formats de competitions et statistiques.
        </p>
      </div>
      <div class="page-grid">
        <div class="page-main">
          <div class="content-grid">
            @for (g of guides; track g.slug) {
              <article class="content-card">
                <h2 class="content-card-title">{{ g.title }}</h2>
                <p class="content-card-desc">{{ g.description }}</p>
                <span class="content-card-meta">Mis a jour : {{ g.updatedAt }}</span>
                <a [routerLink]="'/guides/' + g.slug" class="content-card-link">Lire le guide →</a>
              </article>
            }
          </div>
        </div>
        <aside class="page-sidebar">
          <app-ad-slot variant="sidebar" slot="8567185183" />
          <div class="sidebar-card">
            <h3 class="sidebar-card-title">Explorer</h3>
            <div class="sidebar-links">
              <a routerLink="/news" class="sidebar-link">Articles</a>
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
export class GuidesIndexPageComponent implements OnInit {
  private seo = inject(SeoService);
  readonly guides = guides;

  ngOnInit(): void {
    this.seo.update({
      title: 'Guides football',
      description: 'Guides editoriaux pour comprendre les regles du football, les tactiques, les formats de competitions et les statistiques avancees.',
      path: '/guides',
    });
  }
}
