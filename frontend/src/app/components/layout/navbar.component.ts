import { Component, inject, signal, effect, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SearchService } from '../../services/search.service';

const NAV_ITEMS = [
  { to: '/', label: 'Accueil', exact: true },
  { to: '/en-direct', label: 'En direct', exact: false },
  { to: '/guides', label: 'Guides', exact: false },
  { to: '/news', label: 'Actualites', exact: false },
  { to: '/teams', label: 'Equipes', exact: false },
  { to: '/competitions', label: 'Competitions', exact: false },
];

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="navbar-inner">
        <a routerLink="/" class="navbar-brand">
          <span class="navbar-brand-icon">LF</span>
          <span>LiveFoot</span>
        </a>

        <div class="navbar-nav">
          @for (item of navItems; track item.to) {
            <a
              [routerLink]="item.to"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.exact }"
              class="navbar-link"
            >{{ item.label }}</a>
          }
        </div>

        <label class="navbar-search">
          <span class="navbar-search-icon">🔍</span>
          <input
            type="search"
            placeholder="Rechercher..."
            [value]="localSearch()"
            (input)="onSearchInput($event)"
            aria-label="Recherche"
          />
        </label>

        <button
          type="button"
          class="navbar-hamburger"
          aria-label="Menu"
          (click)="menuOpen.set(!menuOpen())"
        >{{ menuOpen() ? '✕' : '☰' }}</button>
      </div>

      <div class="navbar-mobile-menu" [class.open]="menuOpen()">
        @for (item of navItems; track item.to) {
          <a
            [routerLink]="item.to"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="navbar-link"
            (click)="menuOpen.set(false)"
          >{{ item.label }}</a>
        }
        <label class="navbar-search" style="margin-top: 8px">
          <span class="navbar-search-icon">🔍</span>
          <input
            type="search"
            placeholder="Rechercher..."
            [value]="localSearch()"
            (input)="onSearchInput($event)"
            aria-label="Recherche mobile"
          />
        </label>
      </div>
    </nav>
  `,
})
export class NavbarComponent implements OnDestroy {
  private searchService = inject(SearchService);
  readonly navItems = NAV_ITEMS;
  readonly menuOpen = signal(false);
  readonly localSearch = signal('');
  private debounceTimer: ReturnType<typeof setTimeout> | undefined;

  private searchEffect = effect(() => {
    const value = this.localSearch();
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.searchService.update(value), 250);
  });

  ngOnDestroy(): void {
    clearTimeout(this.debounceTimer);
  }

  onSearchInput(event: Event): void {
    this.localSearch.set((event.target as HTMLInputElement).value);
  }
}
