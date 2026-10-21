import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SearchService {
  readonly searchTerm = signal('');

  update(term: string): void {
    this.searchTerm.set(term);
  }
}
