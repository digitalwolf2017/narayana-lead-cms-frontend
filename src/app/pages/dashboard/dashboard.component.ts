import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { LeadsTableComponent } from '../../components/leads-table/leads-table.component';
import { StatsComponent } from '../../components/stats/stats.component';
import { LeadsBarChartComponent } from '../../components/leads-bar-chart/leads-bar-chart.component';
import { LeadsPieChartComponent } from '../../components/leads-pie-chart/leads-pie-chart.component';
import { NotificationPanelComponent } from '../../components/notification-panel/notification-panel.component';
import { ToastService } from '../../core/services/toast.service';

export type TimeframeOption = 'today' | '7d' | '30d' | 'quarter' | 'all';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    TopbarComponent,
    SidebarComponent,
    StatsComponent,
    LeadsTableComponent,
    LeadsBarChartComponent,
    LeadsPieChartComponent,
    NotificationPanelComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  // ACTIVE TIMEFRAME
  timeframe: TimeframeOption = '30d';

  // STATS STATE
  totalLeads = 1284;
  todayLeads = 42;
  otpVerified = 1128;
  conversionRate = 24.6;
  totalLeadsTrend = '+14.8%';
  todayLeadsTrend = '+8 vs y\'day';
  otpRate = 87.9;
  timeFrameLabel = 'vs last 30d';

  // PLATFORM HEALTH & CMS HIGHLIGHTS
  publishedPagesCount = 11;
  activeBranchesCount = 15;
  activeCitiesCount = 3;
  gatewayUptime = '99.8%';

  readonly todayFormattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  setTimeframe(tf: TimeframeOption): void {
    this.timeframe = tf;
    switch (tf) {
      case 'today':
        this.totalLeads = 42;
        this.todayLeads = 42;
        this.otpVerified = 38;
        this.conversionRate = 26.2;
        this.totalLeadsTrend = '+18.5%';
        this.todayLeadsTrend = '+6 in last 4h';
        this.otpRate = 90.5;
        this.timeFrameLabel = 'today';
        break;
      case '7d':
        this.totalLeads = 318;
        this.todayLeads = 42;
        this.otpVerified = 286;
        this.conversionRate = 23.4;
        this.totalLeadsTrend = '+11.2%';
        this.todayLeadsTrend = '+8 vs y\'day';
        this.otpRate = 89.9;
        this.timeFrameLabel = 'vs prior 7 days';
        break;
      case '30d':
        this.totalLeads = 1284;
        this.todayLeads = 42;
        this.otpVerified = 1128;
        this.conversionRate = 24.6;
        this.totalLeadsTrend = '+14.8%';
        this.todayLeadsTrend = '+8 vs y\'day';
        this.otpRate = 87.9;
        this.timeFrameLabel = 'vs last 30 days';
        break;
      case 'quarter':
        this.totalLeads = 4120;
        this.todayLeads = 42;
        this.otpVerified = 3680;
        this.conversionRate = 22.8;
        this.totalLeadsTrend = '+22.5%';
        this.todayLeadsTrend = '+8 vs y\'day';
        this.otpRate = 89.3;
        this.timeFrameLabel = 'vs last quarter';
        break;
      case 'all':
        this.totalLeads = 12840;
        this.todayLeads = 42;
        this.otpVerified = 11280;
        this.conversionRate = 19.3;
        this.totalLeadsTrend = '+34.0%';
        this.todayLeadsTrend = '+8 vs y\'day';
        this.otpRate = 87.8;
        this.timeFrameLabel = 'all-time record';
        break;
    }
  }

  navigateToAddPage(): void {
    this.router.navigate(['/dynamic-pages/add']);
  }

  navigateToPages(): void {
    this.router.navigate(['/dynamic-pages']);
  }

  navigateToLeads(): void {
    this.router.navigate(['/leads']);
  }

  navigateToBranches(): void {
    this.router.navigate(['/branches']);
  }

  navigateToCities(): void {
    this.router.navigate(['/cities']);
  }

  navigateToRules(): void {
    this.router.navigate(['/download-rules']);
  }

  exportSummary(): void {
    this.toast.success('Executive pipeline summary exported successfully as CSV.');
  }
}