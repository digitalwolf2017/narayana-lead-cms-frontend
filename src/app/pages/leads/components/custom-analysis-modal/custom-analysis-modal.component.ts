import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeadItem } from '../../../../services/lead.service';
import { ToastService } from '../../../../core/services/toast.service';
import {
  CustomAnalysisBreakdownItem,
  CustomAnalysisDayFilter,
  CustomAnalysisDimension,
  CustomAnalysisFilterParams,
  CustomAnalysisTimeframe,
} from '../../models/lead-analysis.model';
import {
  isOtpVerified,
  isTestLead,
  normalizePhone,
} from '../../utils/lead-filters.util';

@Component({
  selector: 'app-custom-analysis-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-analysis-modal.component.html',
})
export class CustomAnalysisModalComponent implements OnChanges {
  private readonly toastService = inject(ToastService);
  protected readonly cdr = inject(ChangeDetectorRef);

  @Input() isOpen = false;
  @Input() leads: LeadItem[] = [];
  @Input() initialDateFrom = '';
  @Input() initialDateTo = '';
  @Input() initialExcludeTest = false;
  @Input() initialPhoneMode: 'all' | 'unique' | 'duplicates_only' = 'all';

  @Output() close = new EventEmitter<void>();
  @Output() applyFilters = new EventEmitter<CustomAnalysisFilterParams>();

  analysisDimension: CustomAnalysisDimension = 'day';
  analysisTimeframe: CustomAnalysisTimeframe = 'all';
  analysisCustomDateFrom = '';
  analysisCustomDateTo = '';
  analysisDayFilter: CustomAnalysisDayFilter = 'all';
  analysisExcludeTest = false;
  analysisPhoneMode: 'all' | 'unique' | 'duplicates_only' = 'all';

  readonly dayOptions: { key: CustomAnalysisDayFilter; short: string; label: string }[] = [
    { key: 'mon', short: 'Mon', label: 'Monday' },
    { key: 'tue', short: 'Tue', label: 'Tuesday' },
    { key: 'wed', short: 'Wed', label: 'Wednesday' },
    { key: 'thu', short: 'Thu', label: 'Thursday' },
    { key: 'fri', short: 'Fri', label: 'Friday' },
    { key: 'sat', short: 'Sat', label: 'Saturday' },
    { key: 'sun', short: 'Sun', label: 'Sunday' },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      // Sync initial state when modal opens if not customized
      if (this.initialDateFrom || this.initialDateTo) {
        this.analysisCustomDateFrom = this.initialDateFrom;
        this.analysisCustomDateTo = this.initialDateTo;
        this.analysisTimeframe = 'custom';
      }
      this.analysisExcludeTest = this.initialExcludeTest;
      this.analysisPhoneMode = this.initialPhoneMode;
      this.cdr.markForCheck();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.onClose();
    }
  }

  onClose(): void {
    this.close.emit();
  }

  get hasActiveCustomAnalysisFilters(): boolean {
    return (
      this.analysisTimeframe !== 'all' ||
      this.analysisDayFilter !== 'all' ||
      this.analysisExcludeTest ||
      this.analysisPhoneMode !== 'all' ||
      !!this.analysisCustomDateFrom ||
      !!this.analysisCustomDateTo
    );
  }

  private formatDateStr(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  setAnalysisTimeframe(preset: CustomAnalysisTimeframe): void {
    this.analysisTimeframe = preset;
    const now = new Date();
    if (preset === 'today') {
      const today = this.formatDateStr(now);
      this.analysisCustomDateFrom = today;
      this.analysisCustomDateTo = today;
    } else if (preset === 'yesterday') {
      const yest = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const str = this.formatDateStr(yest);
      this.analysisCustomDateFrom = str;
      this.analysisCustomDateTo = str;
    } else if (preset === '7d') {
      const past = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
      this.analysisCustomDateFrom = this.formatDateStr(past);
      this.analysisCustomDateTo = this.formatDateStr(now);
    } else if (preset === '14d') {
      const past = new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000);
      this.analysisCustomDateFrom = this.formatDateStr(past);
      this.analysisCustomDateTo = this.formatDateStr(now);
    } else if (preset === '30d') {
      const past = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
      this.analysisCustomDateFrom = this.formatDateStr(past);
      this.analysisCustomDateTo = this.formatDateStr(now);
    } else if (preset === 'all') {
      this.analysisCustomDateFrom = '';
      this.analysisCustomDateTo = '';
    }
    this.cdr.markForCheck();
  }

  setAnalysisDayFilter(day: CustomAnalysisDayFilter): void {
    this.analysisDayFilter = day;
    this.cdr.markForCheck();
  }

  setAnalysisDimension(dim: CustomAnalysisDimension): void {
    this.analysisDimension = dim;
    this.cdr.markForCheck();
  }

  resetCustomAnalysis(): void {
    this.analysisTimeframe = 'all';
    this.analysisCustomDateFrom = '';
    this.analysisCustomDateTo = '';
    this.analysisDayFilter = 'all';
    this.analysisDimension = 'day';
    this.analysisExcludeTest = false;
    this.analysisPhoneMode = 'all';
    this.cdr.markForCheck();
  }

  onCustomDateChange(): void {
    this.analysisTimeframe = 'custom';
    this.cdr.markForCheck();
  }

  toggleAnalysisExcludeTest(): void {
    this.analysisExcludeTest = !this.analysisExcludeTest;
    this.cdr.markForCheck();
  }

  setAnalysisPhoneMode(mode: 'all' | 'unique' | 'duplicates_only'): void {
    this.analysisPhoneMode = mode;
    this.cdr.markForCheck();
  }

  onDimensionChange(): void {
    this.cdr.markForCheck();
  }

  applyCustomAnalysisToTable(): void {
    this.applyFilters.emit({
      dateFrom: this.analysisCustomDateFrom,
      dateTo: this.analysisCustomDateTo,
      excludeTest: this.analysisExcludeTest,
      phoneMode: this.analysisPhoneMode,
    });
    this.onClose();
  }

  getDimensionLabel(dim: CustomAnalysisDimension): string {
    switch (dim) {
      case 'day': return 'Date / Day';
      case 'day_of_week': return 'Day of Week';
      case 'branch': return 'Branch / School';
      case 'city': return 'City';
      case 'class': return 'Class / Grade';
      case 'board': return 'Board';
      case 'utm_source': return 'Marketing UTM Source';
      case 'otp_validation': return 'OTP Verification Status';
      default: return 'Dimension';
    }
  }

  get customAnalysisResult() {
    const baseLeads = this.leads;
    if (!baseLeads || baseLeads.length === 0) {
      return {
        totalLeads: 0,
        avgLeadsPerDay: '0.0',
        activeDaysCount: 0,
        otpVerifiedRate: '0.0',
        otpVerifiedCount: 0,
        uniquePhoneRate: '0.0',
        duplicateRate: '0.0',
        peakLabel: '—',
        peakCount: 0,
        breakdown: [] as CustomAnalysisBreakdownItem[],
      };
    }

    const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Pre-calculate phone occurrences for duplicate filtering
    const phoneCounts = new Map<string, number>();
    for (const lead of baseLeads) {
      const p = normalizePhone(lead.phone);
      if (p) phoneCounts.set(p, (phoneCounts.get(p) || 0) + 1);
    }

    const filtered: LeadItem[] = [];

    for (const lead of baseLeads) {
      if (this.analysisExcludeTest && isTestLead(lead)) {
        continue;
      }

      const normPhone = normalizePhone(lead.phone);
      if (this.analysisPhoneMode === 'duplicates_only') {
        if (!normPhone || (phoneCounts.get(normPhone) || 0) <= 1) continue;
      }

      const rawDate = lead.entrydate ? lead.entrydate.split(' ')[0] : '';
      if (this.analysisCustomDateFrom && rawDate && rawDate < this.analysisCustomDateFrom) {
        continue;
      }
      if (this.analysisCustomDateTo && rawDate && rawDate > this.analysisCustomDateTo) {
        continue;
      }

      if (rawDate) {
        const [y, m, d] = rawDate.split('-').map(Number);
        const dayIdx = new Date(y, m - 1, d).getDay();
        if (this.analysisDayFilter === 'mon' && dayIdx !== 1) continue;
        if (this.analysisDayFilter === 'tue' && dayIdx !== 2) continue;
        if (this.analysisDayFilter === 'wed' && dayIdx !== 3) continue;
        if (this.analysisDayFilter === 'thu' && dayIdx !== 4) continue;
        if (this.analysisDayFilter === 'fri' && dayIdx !== 5) continue;
        if (this.analysisDayFilter === 'sat' && dayIdx !== 6) continue;
        if (this.analysisDayFilter === 'sun' && dayIdx !== 0) continue;
        if (this.analysisDayFilter === 'weekdays' && (dayIdx === 0 || dayIdx === 6)) continue;
        if (this.analysisDayFilter === 'weekends' && dayIdx >= 1 && dayIdx <= 5) continue;
      }

      filtered.push(lead);
    }

    let analyzedLeads = filtered;
    if (this.analysisPhoneMode === 'unique') {
      const seen = new Set<string>();
      analyzedLeads = filtered.filter((l) => {
        const p = normalizePhone(l.phone);
        if (!p) return true;
        if (seen.has(p)) return false;
        seen.add(p);
        return true;
      });
    }

    const totalLeads = analyzedLeads.length;
    if (totalLeads === 0) {
      return {
        totalLeads: 0,
        avgLeadsPerDay: '0.0',
        activeDaysCount: 0,
        otpVerifiedRate: '0.0',
        otpVerifiedCount: 0,
        uniquePhoneRate: '0.0',
        duplicateRate: '0.0',
        peakLabel: '—',
        peakCount: 0,
        breakdown: [] as CustomAnalysisBreakdownItem[],
      };
    }

    const daySet = new Set<string>();
    let otpCount = 0;
    const phoneSet = new Set<string>();
    let totalWithPhone = 0;

    interface GroupAcc {
      key: string;
      label: string;
      count: number;
      otpValidCount: number;
      phones: Set<string>;
    }
    const groupMap = new Map<string, GroupAcc>();

    for (const lead of analyzedLeads) {
      const rawDate = lead.entrydate ? lead.entrydate.split(' ')[0] : '';
      if (rawDate) daySet.add(rawDate);

      const isValidOtp = isOtpVerified(lead);
      if (isValidOtp) otpCount++;

      const p = normalizePhone(lead.phone);
      if (p) {
        totalWithPhone++;
        phoneSet.add(p);
      }

      let groupKey = '';
      let groupLabel = '';
      let dayIdx = 0;
      if (rawDate) {
        const [y, m, d] = rawDate.split('-').map(Number);
        dayIdx = new Date(y, m - 1, d).getDay();
      }

      switch (this.analysisDimension) {
        case 'day':
          groupKey = rawDate || 'Unknown Date';
          groupLabel = rawDate || 'Unknown Date';
          break;
        case 'day_of_week':
          groupKey = String(dayIdx);
          groupLabel = DAY_NAMES[dayIdx] || 'Unknown';
          break;
        case 'branch':
          groupKey = (lead.branch || 'Unassigned').trim();
          groupLabel = groupKey;
          break;
        case 'city':
          groupKey = (lead.city || 'Unassigned').trim();
          groupLabel = groupKey;
          break;
        case 'class':
          groupKey = (lead.class || 'Unassigned').trim();
          groupLabel = groupKey;
          break;
        case 'board':
          groupKey = (lead.board || 'Unassigned').trim();
          groupLabel = groupKey;
          break;
        case 'utm_source':
          groupKey = (lead.utm_source || 'Direct / Organic').trim();
          groupLabel = groupKey;
          break;
        case 'otp_validation':
          groupKey = isValidOtp ? 'OTP Verified' : 'OTP Unverified / Invalid';
          groupLabel = groupKey;
          break;
      }

      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          key: groupKey,
          label: groupLabel,
          count: 0,
          otpValidCount: 0,
          phones: new Set<string>(),
        });
      }
      const g = groupMap.get(groupKey)!;
      g.count++;
      if (isValidOtp) g.otpValidCount++;
      if (p) g.phones.add(p);
    }

    const activeDaysCount = Math.max(1, daySet.size);
    const avgLeadsPerDay = (totalLeads / activeDaysCount).toFixed(1);
    const otpVerifiedRate = ((otpCount / totalLeads) * 100).toFixed(1);
    const uniquePhoneRate =
      totalWithPhone > 0
        ? ((phoneSet.size / totalWithPhone) * 100).toFixed(1)
        : '100.0';
    const duplicateRate = Math.max(0, 100 - parseFloat(uniquePhoneRate)).toFixed(1);

    const breakdown: CustomAnalysisBreakdownItem[] = Array.from(groupMap.values()).map((g) => ({
      key: g.key,
      label: g.label,
      count: g.count,
      percentage: Number(((g.count / totalLeads) * 100).toFixed(1)),
      otpValidCount: g.otpValidCount,
      otpValidRate: g.count > 0 ? Number(((g.otpValidCount / g.count) * 100).toFixed(1)) : 0,
      uniquePhoneCount: g.phones.size,
    }));

    breakdown.sort((a, b) => b.count - a.count);

    const peak = breakdown[0];
    const peakLabel = peak ? `${peak.label} (${peak.count} leads)` : '—';
    const peakCount = peak ? peak.count : 0;

    return {
      totalLeads,
      avgLeadsPerDay,
      activeDaysCount,
      otpVerifiedRate,
      otpVerifiedCount: otpCount,
      uniquePhoneRate,
      duplicateRate,
      peakLabel,
      peakCount,
      breakdown,
    };
  }

  exportCustomAnalysisCsv(): void {
    const result = this.customAnalysisResult;
    if (!result.breakdown || result.breakdown.length === 0) {
      this.toastService.error('No analysis data to export.');
      return;
    }

    const dimensionName = this.getDimensionLabel(this.analysisDimension);
    const headers = [
      'Dimension',
      'Segment',
      'Leads Count',
      'Share Percentage',
      'OTP Verified Count',
      'OTP Verified Rate %',
      'Unique Phones',
    ];
    const rows = result.breakdown.map((item) => [
      `"${dimensionName}"`,
      `"${item.label.replace(/"/g, '""')}"`,
      item.count,
      `${item.percentage}%`,
      item.otpValidCount,
      `${item.otpValidRate}%`,
      item.uniquePhoneCount,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom_analysis_${this.analysisDimension}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    this.toastService.success('Custom analysis exported to CSV.');
  }
}
