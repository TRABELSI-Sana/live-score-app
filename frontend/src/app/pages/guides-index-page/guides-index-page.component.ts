import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { AdSlotComponent } from '../../components/ads/ad-slot/ad-slot.component';
import { guides } from '../../content/guides';

@Component({
  selector: 'app-guides-index-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent],
  templateUrl: './guides-index-page.component.html',
  styleUrl: './guides-index-page.component.css',
})
export class GuidesIndexPageComponent implements OnInit {
  private seo = inject(SeoService);
  readonly guides = guides;

  ngOnInit(): void {
    this.seo.update({
      title: 'Guides football',
      description:
        'Guides editoriaux pour comprendre les regles du football, les tactiques, les formats de competitions et les statistiques avancees.',
      path: '/guides',
    });
  }
}
