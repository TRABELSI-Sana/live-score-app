import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/layout/layout.component').then(
        (m) => m.LayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/home-page.component').then(
            (m) => m.HomePageComponent
          ),
      },
      {
        path: 'en-direct',
        loadComponent: () =>
          import('./pages/live-page.component').then(
            (m) => m.LivePageComponent
          ),
      },
      {
        path: 'guides',
        loadComponent: () =>
          import('./pages/guides-index-page.component').then(
            (m) => m.GuidesIndexPageComponent
          ),
      },
      {
        path: 'guides/:slug',
        loadComponent: () =>
          import('./pages/guide-page.component').then(
            (m) => m.GuidePageComponent
          ),
      },
      {
        path: 'news',
        loadComponent: () =>
          import('./pages/articles-index-page.component').then(
            (m) => m.ArticlesIndexPageComponent
          ),
      },
      {
        path: 'news/:slug',
        loadComponent: () =>
          import('./pages/article-page.component').then(
            (m) => m.ArticlePageComponent
          ),
      },
      {
        path: 'teams',
        loadComponent: () =>
          import('./pages/teams-index-page.component').then(
            (m) => m.TeamsIndexPageComponent
          ),
      },
      {
        path: 'teams/:slug',
        loadComponent: () =>
          import('./pages/team-page.component').then(
            (m) => m.TeamPageComponent
          ),
      },
      {
        path: 'competitions',
        loadComponent: () =>
          import('./pages/competitions-index-page.component').then(
            (m) => m.CompetitionsIndexPageComponent
          ),
      },
      {
        path: 'competitions/:slug',
        loadComponent: () =>
          import('./pages/competition-page.component').then(
            (m) => m.CompetitionPageComponent
          ),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
