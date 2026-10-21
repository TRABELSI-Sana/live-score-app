import { Component } from '@angular/core';
import { AiSummaryCardComponent } from './ai-summary-card.component';
import { QuickLinksCardComponent } from './quick-links-card.component';
import { AdSlotComponent } from '../ads/ad-slot.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  host: { class: 'page-sidebar', role: 'complementary' },
  imports: [AiSummaryCardComponent, QuickLinksCardComponent, AdSlotComponent],
  template: `
      <app-ai-summary-card />
      <app-ad-slot variant="sidebar" slot="8567185183" />
      <app-quick-links-card />
      <app-ad-slot variant="sidebar" slot="8567185183" />
  `,
})
export class SidebarComponent {}
