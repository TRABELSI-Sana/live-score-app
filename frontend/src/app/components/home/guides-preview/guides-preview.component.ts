import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { guides } from '../../../content/guides';

@Component({
  selector: 'app-guides-preview',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './guides-preview.component.html',
  styleUrl: './guides-preview.component.css',
})
export class GuidesPreviewComponent {
  readonly featured = guides.slice(0, 3);
}
