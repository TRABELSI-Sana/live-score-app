import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../services/seo.service';
import { AdSlotComponent } from '../../components/ads/ad-slot/ad-slot.component';
import { articles } from '../../content/articles';

@Component({
  selector: 'app-articles-index-page',
  standalone: true,
  imports: [RouterLink, AdSlotComponent],
  templateUrl: './articles-index-page.component.html',
  styleUrl: './articles-index-page.component.css',
})
export class ArticlesIndexPageComponent implements OnInit {
  private seo = inject(SeoService);
  readonly articles = articles;

  ngOnInit(): void {
    this.seo.update({
      title: 'Actualites football — Analyses, tactiques et decryptages',
      description:
        'Articles football originaux : analyses tactiques, formations, pressing, xG, derbys, mercato, VAR et decryptages pour comprendre le jeu au-dela du score.',
      path: '/news',
    });
  }
}
