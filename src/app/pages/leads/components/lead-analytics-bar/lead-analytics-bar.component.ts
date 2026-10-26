import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeadItem } from '../../../../services/lead.service';
import { LeadAnalyticsMetrics } from '../../models/lead-analysis.model';
import { isOtpVerified, normalizePhone } from '../../utils/lead-filters.util';

@Component({
  selector: 'app-lead-analytics-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './lead-analytics-bar.component.html',
})
export class LeadAnalyticsBarComponent {
  @Input() leads: LeadItem[] = [];
  @Input() dateFrom = '';
  @Input() dateTo = '';
  @Input() hasActiveCustomFilters = false;
  @Input() isOpen = true;

  @Output() openCustomAnalysis = new EventEmitter<void>();
  @Output() toggleOpen = new EventEmitter<void>();

  get metrics(): LeadAnalyticsMetrics {
    const data = this.leads;
    const total = data.length;
    if (total === 0) {
      return {
        avgLeadsPerDay: '0.0',
        activeDaysCount: 0,
        otpVerifiedRate: '0.0',
        otpVerifiedCount: 0,
        uniquePhoneRate: '0.0',
        duplicateRate: '0.0',
        peakDate: '—',
        peakCount: 0,
        dateSpanLabel: 'No active leads',
      };
    }

    const dayMap = new Map<string, number>();
    let otpCount = 0;
    const phoneSet = new Set<string>();
    let totalWithPhone = 0;

    for (const lead of data) {
      const rawDate = lead.entrydate ? lead.entrydate.split(' ')[0] : '';
      if (rawDate) {
        dayMap.set(rawDate, (dayMap.get(rawDate) || 0) + 1);
      }

      if (isOtpVerified(lead)) {
        otpCount++;
      }

      const p = normalizePhone(lead.phone);
      if (p) {
        totalWithPhone++;
        phoneSet.add(p);
      }
    }

    let daysCount = 0;
    let dateSpanLabel = '';
    if (this.dateFrom && this.dateTo) {
      const d1 = new Date(this.dateFrom).getTime();
      const d2 = new Date(this.dateTo).getTime();
      daysCount = Math.max(
        1,
        Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24)) + 1
      );
      dateSpanLabel = `Over ${daysCount} calendar days`;
    } else {
      daysCount = Math.max(1, dayMap.size);
      dateSpanLabel = `Across ${daysCount} active days`;
    }

    const avgLeadsPerDay = (total / daysCount).toFixed(1);
    const otpVerifiedRate = ((otpCount / total) * 100).toFixed(1);
    const uniquePhoneRate =
      totalWithPhone > 0
        ? ((phoneSet.size / totalWithPhone) * 100).toFixed(1)
        : '100.0';
    const duplicateRate = Math.max(
      0,
      100 - parseFloat(uniquePhoneRate)
    ).toFixed(1);

    let peakDate = '—';
    let peakCount = 0;
    for (const [day, count] of dayMap.entries()) {
      if (count > peakCount) {
        peakCount = count;
        peakDate = day;
      }
    }

    return {
      avgLeadsPerDay,
      activeDaysCount: daysCount,
      otpVerifiedRate,
      otpVerifiedCount: otpCount,
      uniquePhoneRate,
      duplicateRate,
      peakDate,
      peakCount,
      dateSpanLabel,
    };
  }

  onOpenCustomAnalysis(): void {
    this.openCustomAnalysis.emit();
  }

  onToggleOpen(): void {
    this.toggleOpen.emit();
  }
}
