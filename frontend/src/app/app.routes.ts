import { Routes } from '@angular/router';

// Le layout reste affiché ; seule sa route enfant change selon l’URL.
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/layout/layout.component').then((m) => m.LayoutComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () =>
          import('./pages/home-page/home-page.component').then((m) => m.HomePageComponent),
      },
      {
        path: 'en-direct',
        loadComponent: () =>
          import('./pages/live-page/live-page.component').then((m) => m.LivePageComponent),
      },
      {
        path: 'guides',
        loadComponent: () =>
          import('./pages/guides-index-page/guides-index-page.component').then(
            (m) => m.GuidesIndexPageComponent,
          ),
      },
      {
        path: 'guides/:slug',
        loadComponent: () =>
          import('./pages/guide-page/guide-page.component').then((m) => m.GuidePageComponent),
      },
      {
        path: 'news',
        loadComponent: () =>
          import('./pages/articles-index-page/articles-index-page.component').then(
            (m) => m.ArticlesIndexPageComponent,
          ),
      },
      {
        path: 'news/:slug',
        loadComponent: () =>
          import('./pages/article-page/article-page.component').then((m) => m.ArticlePageComponent),
      },
      {
        path: 'teams',
        loadComponent: () =>
          import('./pages/teams-index-page/teams-index-page.component').then(
            (m) => m.TeamsIndexPageComponent,
          ),
      },
      {
        path: 'teams/:slug',
        loadComponent: () =>
          import('./pages/team-page/team-page.component').then((m) => m.TeamPageComponent),
      },
      {
        path: 'competitions',
        loadComponent: () =>
          import('./pages/competitions-index-page/competitions-index-page.component').then(
            (m) => m.CompetitionsIndexPageComponent,
          ),
      },
      {
        path: 'competitions/:slug',
        loadComponent: () =>
          import('./pages/competition-page/competition-page.component').then(
            (m) => m.CompetitionPageComponent,
          ),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
