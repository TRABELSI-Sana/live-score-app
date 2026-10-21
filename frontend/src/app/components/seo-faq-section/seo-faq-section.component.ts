import { Component, Input } from '@angular/core';
import type { SeoFaq } from '../../models/content.model';

@Component({
  selector: 'app-seo-faq-section',
  standalone: true,
  templateUrl: './seo-faq-section.component.html',
  styleUrl: './seo-faq-section.component.css',
})
export class SeoFaqSectionComponent {
  @Input() title = 'Questions frequentes';
  @Input({ required: true }) faqs!: SeoFaq[];
}
