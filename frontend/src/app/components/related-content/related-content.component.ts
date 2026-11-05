import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { RelatedLink } from '../../utils/related-content';

@Component({
  selector: 'app-related-content',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './related-content.component.html',
  styleUrl: './related-content.component.css',
})
export class RelatedContentComponent {
  @Input() title = 'A lire aussi';
  @Input() links: RelatedLink[] = [];
}
