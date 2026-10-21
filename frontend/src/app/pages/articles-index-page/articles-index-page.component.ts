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
      title: 'Actualites et analyses football',
      description:
        'Articles editoriaux pour comprendre les scores, les statistiques et les tendances du football. Analyses tactiques et decryptages.',
      path: '/news',
    });
  }
}
