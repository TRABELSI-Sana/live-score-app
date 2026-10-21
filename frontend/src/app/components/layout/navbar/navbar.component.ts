import { Component, inject, signal, effect, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { SearchService } from '../../../services/search.service';

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
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
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
