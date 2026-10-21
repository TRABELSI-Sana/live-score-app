import { Component, Input } from '@angular/core';
import type { SeoFaq } from '../models/content.model';

@Component({
  selector: 'app-seo-faq-section',
  standalone: true,
  template: `
    <section class="seo-faq">
      <h2>{{ title }}</h2>
      <div class="seo-faq-list">
        @for (faq of faqs; track faq.question) {
          <article class="seo-faq-item">
            <h3>{{ faq.question }}</h3>
            <p>{{ faq.answer }}</p>
          </article>
        }
      </div>
    </section>
  `,
})
export class SeoFaqSectionComponent {
  @Input() title = 'Questions frequentes';
  @Input({ required: true }) faqs!: SeoFaq[];
}
