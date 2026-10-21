import { Component } from '@angular/core';
import { AiSummaryCardComponent } from './ai-summary-card/ai-summary-card.component';
import { QuickLinksCardComponent } from './quick-links-card/quick-links-card.component';
import { AdSlotComponent } from '../ads/ad-slot/ad-slot.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  host: { class: 'page-sidebar', role: 'complementary' },
  imports: [AiSummaryCardComponent, QuickLinksCardComponent, AdSlotComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {}
