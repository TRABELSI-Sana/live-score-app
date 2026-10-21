import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { articles } from '../../../content/articles';

@Component({
  selector: 'app-editorial-preview',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './editorial-preview.component.html',
  styleUrl: './editorial-preview.component.css',
})
export class EditorialPreviewComponent {
  readonly latest = articles.slice(0, 3);
}
