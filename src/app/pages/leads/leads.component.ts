import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';
import { Subject, Subscription, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs/operators';

import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { DateRangePickerComponent } from '../../components/date-range-picker/date-range-picker.component';
import {
  LeadItem,
  LeadMeta,
  LeadModule,
  LeadService,
} from '../../services/lead.service';

export interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  optional: boolean;
}

@Component({
  selector: 'app-leads',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush, // Step 1: OnPush
  imports: [CommonModule, FormsModule, TopbarComponent, SidebarComponent, DateRangePickerComponent],
  templateUrl: './leads.component.html',
})
export class LeadsComponent implements OnInit, OnDestroy {
  private readonly leadService = inject(LeadService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  private routeSub?: Subscription;
  private fetchSub?: Subscription;
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;
  private dateSubject = new Subject<void>(); // Step 7: debounced date filter
  private dateSub?: Subscription;  private readonly fetchTrigger$ = new Subject<Record<string, unknown>>();  private pageCache = new Map<string, { leads: LeadItem[]; meta: LeadMeta }>();
  private currentCacheKey = '';  readonly skeletonRows = Array(10).fill(0);  modules: LeadModule[] = [];
  selectedModuleKey = '';
  isLoadingModules = false;  leads: LeadItem[] = [];
  meta: LeadMeta = { page: 1, per_page: 25, total: 0, filtered: 0, total_pages: 1 };
  isLoadingLeads = false;
  loadError = '';  searchTerm = '';
  dateFrom = '';
  dateTo = '';
  perPage = 25;
  currentPage = 1;
  selectedLead: LeadItem | null = null;
  isDetailModalOpen = false;
  copiedField = '';
  isExporting = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  isColumnsDropdownOpen = false;
  private readonly STORAGE_KEY = 'leads_column_prefs';

  // Frontend Filters: Test Leads & Duplicate Phone
  excludeTestLeads = false;
  testKeyword = 'test';
  phoneFilterMode: 'all' | 'unique' | 'duplicates_only' = 'all';
  isFilterMenuOpen = false;

  columns: ColumnConfig[] = [
    { key: 'id', label: 'ID', visible: true, optional: true },
    { key: 'entrydate', label: 'Entry Date', visible: true, optional: true },
    { key: 'name', label: 'Name', visible: true, optional: true },
    { key: 'phone', label: 'Phone', visible: true, optional: true },
    { key: 'parent_email', label: 'Email', visible: true, optional: true },
    { key: 'otp_validation', label: 'OTP', visible: true, optional: true },
    { key: 'city', label: 'City', visible: true, optional: true },
    { key: 'branch', label: 'Branch', visible: true, optional: true },
    { key: 'board', label: 'Board', visible: true, optional: true },
    { key: 'class', label: 'Class', visible: true, optional: true },
    { key: 'class_category', label: 'Class Category', visible: true, optional: true },
    { key: 'stream', label: 'Stream', visible: true, optional: true },
    { key: 'course', label: 'Course', visible: true, optional: true },
    { key: 'reservation_type', label: 'Reservation', visible: true, optional: true },
    { key: 'utm_source', label: 'UTM Source', visible: true, optional: true },
    { key: 'utm_campaign', label: 'UTM Campaign', visible: true, optional: true },
    { key: 'utm_medium', label: 'UTM Medium', visible: false, optional: true },
    { key: 'utm_content', label: 'UTM Content', visible: false, optional: true },
    { key: 'utm_term', label: 'UTM Term', visible: false, optional: true },
    { key: 'redirect_from', label: 'Redirect From', visible: false, optional: true },
    { key: 'page_section', label: 'Page Section', visible: false, optional: true },
  ];  private readonly WIDTHS_STORAGE_KEY = 'leads_column_widths';
  readonly defaultColWidths: Record<string, number> = {
    id: 65,
    entrydate: 140,
    name: 150,
    phone: 110,
    parent_email: 180,
    otp_validation: 85,
    city: 100,
    branch: 110,
    board: 80,
    class: 90,
    class_category: 100,
    stream: 100,
    course: 110,
    reservation_type: 110,
    utm_source: 130,
    utm_campaign: 140,
    utm_medium: 110,
    utm_content: 110,
    utm_term: 110,
    redirect_from: 130,
    page_section: 120,
  };
  colWidths: Record<string, number> = { ...this.defaultColWidths };
  private resizingColKey: string | null = null;
  private startX = 0;
  private startWidth = 0;  colVisibility: Record<string, boolean> = {};   // O(1) lookup replaces isColVisible()
  visibleColumns: ColumnConfig[] = [];           // replaces optionalColumns getter
  visibleColumnCount = 0;                        // replaces visibleColumnCount getter
  activeModuleLabel = '';                        // replaces activeModule getter in template
  cachedDisplayedPages: number[] = [];           // replaces displayedPages getter

  get activeModule(): LeadModule | undefined {
    return this.modules.find((m) => m.key === this.selectedModuleKey);
  }
  ngOnInit(): void {
    this.loadColumnPrefs();
    this.loadColWidths();
    this.updateColumnCache();    this.fetchSub = this.fetchTrigger$
      .pipe(
        switchMap((params) =>
          this.leadService.getLeads(params as any).pipe(
            catchError((err) => {
              console.error('Fetch leads error:', err);
              return of({
                success: false,
                message: 'Failed to load leads from server.',
                data: [] as LeadItem[],
                meta: {} as LeadMeta,
              });
            })
          )
        )
      )
      .subscribe((response) => {
        this.isLoadingLeads = false;
        if (response.success) {
          this.leads = response.data || [];
          this.meta = response.meta ?? {
            page: this.currentPage,
            per_page: this.perPage,
            total: this.leads.length,
            filtered: this.leads.length,
            total_pages: 1,
          };          this.pageCache.set(this.currentCacheKey, {
            leads: this.leads,
            meta: this.meta,
          });
        } else {
          this.leads = [];
          this.loadError = response.message || 'Unable to load leads.';
        }
        this.updateDisplayedPages();
        this.cdr.markForCheck(); // Step 1: markForCheck instead of detectChanges
      });

    // Search debounce
    this.searchSub = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((term) => {
        this.searchTerm = term;
        this.currentPage = 1;
        this.clearPageCache();
        this.fetchLeads();
      });    this.dateSub = this.dateSubject
      .pipe(debounceTime(400))
      .subscribe(() => {
        this.currentPage = 1;
        this.clearPageCache();
        this.fetchLeads();
      });

    this.loadModules();
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.searchSub?.unsubscribe();
    this.fetchSub?.unsubscribe();
    this.dateSub?.unsubscribe();
    this.fetchTrigger$.complete();
    this.searchSubject.complete();
    this.dateSubject.complete();
    document.removeEventListener('mousemove', this.onResizing);
    document.removeEventListener('mouseup', this.onResizeEnd);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('#columns-dropdown-wrapper')) {
      if (this.isColumnsDropdownOpen) {
        this.isColumnsDropdownOpen = false;
        this.cdr.markForCheck();
      }
    }
    if (!target.closest('#filter-clean-menu-wrapper')) {
      if (this.isFilterMenuOpen) {
        this.isFilterMenuOpen = false;
        this.cdr.markForCheck();
      }
    }
  }
  toggleColumn(key: string): void {
    const col = this.columns.find((c) => c.key === key);
    if (col) {
      col.visible = !col.visible;
      this.saveColumnPrefs();
      this.updateColumnCache();
      this.cdr.markForCheck();
    }
  }

  /** Step 2 & 3: Rebuild all column-derived caches in one pass */
  private updateColumnCache(): void {
    const map: Record<string, boolean> = {};
    const visible: ColumnConfig[] = [];
    for (const col of this.columns) {
      map[col.key] = col.visible;
      if (col.visible) visible.push(col);
    }
    this.colVisibility = map;
    this.visibleColumns = visible;
    this.visibleColumnCount = visible.length;
  }

  private loadColumnPrefs(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const prefs: Record<string, boolean> = JSON.parse(saved);
        this.columns.forEach((col) => {
          if (prefs[col.key] !== undefined) col.visible = prefs[col.key];
        });
      }
    } catch {    }
  }

  private saveColumnPrefs(): void {
    const prefs: Record<string, boolean> = {};
    this.columns.forEach((c) => (prefs[c.key] = c.visible));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefs));
  }
  onResizeStart(event: MouseEvent, colKey: string): void {
    event.preventDefault();
    event.stopPropagation();
    this.resizingColKey = colKey;
    this.startX = event.clientX;
    const th = (event.target as HTMLElement).closest('th');
    this.startWidth = th ? th.offsetWidth : (this.colWidths[colKey] || 100);
    document.addEventListener('mousemove', this.onResizing);
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  private onResizing = (event: MouseEvent): void => {
    if (!this.resizingColKey) return;
    const delta = event.clientX - this.startX;
    const newWidth = Math.max(45, this.startWidth + delta);
    this.colWidths[this.resizingColKey] = newWidth;
    this.cdr.markForCheck();
  };

  private onResizeEnd = (): void => {
    if (this.resizingColKey) {
      this.saveColWidths();
      this.resizingColKey = null;
    }
    document.removeEventListener('mousemove', this.onResizing);
    document.removeEventListener('mouseup', this.onResizeEnd);
    this.cdr.markForCheck();
  };

  private loadColWidths(): void {
    try {
      const saved = localStorage.getItem(this.WIDTHS_STORAGE_KEY);
      if (saved) {
        this.colWidths = { ...this.defaultColWidths, ...JSON.parse(saved) };
      }
    } catch {    }
  }

  private saveColWidths(): void {
    try {
      localStorage.setItem(this.WIDTHS_STORAGE_KEY, JSON.stringify(this.colWidths));
    } catch {    }
  }

  resetColWidths(): void {
    this.colWidths = { ...this.defaultColWidths };
    this.saveColWidths();
    this.cdr.markForCheck();
  }
  loadModules(): void {
    this.isLoadingModules = true;
    this.cdr.markForCheck();

    this.leadService.getModules().subscribe({
      next: (response) => {
        this.isLoadingModules = false;
        if (response.success && Array.isArray(response.data)) {
          this.modules = response.data;

          this.routeSub = this.route.queryParams.subscribe((params) => {
            const requestedModule = params['module'];
            if (requestedModule && this.modules.some((m) => m.key === requestedModule)) {
              this.selectedModuleKey = requestedModule;
              this.activeModuleLabel = this.modules.find((m) => m.key === requestedModule)?.label ?? '';
              this.currentPage = 1;
              this.fetchLeads();
            } else {
              this.selectedModuleKey = '';
              this.activeModuleLabel = '';
              this.leads = [];
              this.meta = { page: 1, per_page: this.perPage, total: 0, filtered: 0, total_pages: 1 };
            }
          });
        }
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoadingModules = false;
        this.loadError = 'Failed to load lead modules.';
        this.cdr.markForCheck();
        console.error('Load modules error:', err);
      },
    });
  }

  onModuleChange(): void {
    if (!this.selectedModuleKey) {
      this.activeModuleLabel = '';
      this.leads = [];
      this.meta = { page: 1, per_page: this.perPage, total: 0, filtered: 0, total_pages: 1 };
      this.cachedDisplayedPages = [];
      this.clearPageCache();
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { module: null },
        queryParamsHandling: 'merge',
      });
      return;
    }

    this.activeModuleLabel = this.modules.find((m) => m.key === this.selectedModuleKey)?.label ?? '';
    this.currentPage = 1;
    this.searchTerm = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.clearPageCache();

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { module: this.selectedModuleKey },
      queryParamsHandling: 'merge',
    });

    this.fetchLeads();
  }
  fetchLeads(): void {
    if (!this.selectedModuleKey) return;

    this.loadError = '';
    this.currentCacheKey = this.buildCacheKey();    const cached = this.pageCache.get(this.currentCacheKey);
    if (cached) {
      this.leads = cached.leads;
      this.meta = cached.meta;
      this.isLoadingLeads = false;
      this.updateDisplayedPages();
      this.cdr.markForCheck();
      return;
    }

    this.isLoadingLeads = true;
    this.cdr.markForCheck();    this.fetchTrigger$.next(this.buildParams());
  }

  private buildParams(): Record<string, unknown> {
    const params: Record<string, unknown> = {
      module: this.selectedModuleKey,
      page: this.currentPage,
      per_page: this.perPage,
    };
    if (this.searchTerm.trim()) params['search'] = this.searchTerm.trim();
    if (this.dateFrom) params['date_from'] = this.dateFrom;
    if (this.dateTo) params['date_to'] = this.dateTo;
    return params;
  }

  private buildCacheKey(): string {
    return `${this.selectedModuleKey}|${this.currentPage}|${this.perPage}|${this.searchTerm}|${this.dateFrom}|${this.dateTo}`;
  }

  private clearPageCache(): void {
    this.pageCache.clear();
  }
  onSearchInput(value: string): void {
    this.searchSubject.next(value);
  }

  onDateFilterChange(): void {
    this.dateSubject.next(); // Step 7: debounced
  }

  onDateRangeChange(range: { startDate: string; endDate: string }): void {
    this.dateFrom = range.startDate;
    this.dateTo = range.endDate;
    this.currentPage = 1;
    this.clearPageCache();
    this.fetchLeads();
  }

  onPerPageChange(): void {
    this.currentPage = 1;
    this.clearPageCache();
    this.fetchLeads();
  }

  normalizePhone(phone?: string): string {
    if (!phone) return '';
    return phone.replace(/\D/g, '').slice(-10);
  }

  isTestLead(lead: LeadItem): boolean {
    const raw = this.testKeyword.trim().toLowerCase();
    const defaultKeywords = ['test', 'demo', 'dummy', 'sample', 'testing', 'trial'];
    const keywords = raw ? Array.from(new Set([raw, ...defaultKeywords])) : defaultKeywords;

    const name = (lead.name || '').toLowerCase();
    const email = (lead.parent_email || '').toLowerCase();
    const phone = (lead.phone || '').trim();

    const matchesWord = keywords.some(
      (k) => name.includes(k) || email.includes(k)
    );
    const isDummyPhone =
      /^([0-9])\1{9}$/.test(phone) ||
      phone === '1234567890' ||
      phone === '9876543210' ||
      phone === '0123456789';

    return matchesWord || isDummyPhone;
  }

  get phoneCounts(): Map<string, number> {
    const counts = new Map<string, number>();
    for (const lead of this.leads) {
      const p = this.normalizePhone(lead.phone);
      if (p) {
        counts.set(p, (counts.get(p) || 0) + 1);
      }
    }
    return counts;
  }

  getPhoneDuplicateCount(lead: LeadItem): number {
    const p = this.normalizePhone(lead.phone);
    if (!p) return 0;
    return this.phoneCounts.get(p) || 0;
  }

  get displayedLeads(): LeadItem[] {
    let result = this.leads;

    // 1. Exclude test leads if enabled
    if (this.excludeTestLeads) {
      result = result.filter((lead) => !this.isTestLead(lead));
    }

    // 2. Phone duplicate filter
    if (this.phoneFilterMode === 'unique') {
      const seenPhones = new Set<string>();
      result = result.filter((lead) => {
        const p = this.normalizePhone(lead.phone);
        if (!p) return true; // keep leads without phone
        if (seenPhones.has(p)) return false;
        seenPhones.add(p);
        return true;
      });
    } else if (this.phoneFilterMode === 'duplicates_only') {
      const counts = this.phoneCounts;
      result = result.filter((lead) => {
        const p = this.normalizePhone(lead.phone);
        return p ? (counts.get(p) || 0) > 1 : false;
      });
    }

    return result;
  }

  get testLeadsCount(): number {
    return this.leads.filter((l) => this.isTestLead(l)).length;
  }

  get duplicatePhoneCount(): number {
    const counts = this.phoneCounts;
    let dupCount = 0;
    for (const count of counts.values()) {
      if (count > 1) {
        dupCount += count;
      }
    }
    return dupCount;
  }

  get hasActiveFrontendFilters(): boolean {
    return this.excludeTestLeads || this.phoneFilterMode !== 'all';
  }

  toggleExcludeTestLeads(): void {
    this.excludeTestLeads = !this.excludeTestLeads;
    this.cdr.markForCheck();
  }

  setPhoneFilterMode(mode: 'all' | 'unique' | 'duplicates_only'): void {
    this.phoneFilterMode = mode;
    this.cdr.markForCheck();
  }

  clearFrontendFilters(): void {
    this.excludeTestLeads = false;
    this.phoneFilterMode = 'all';
    this.cdr.markForCheck();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.excludeTestLeads = false;
    this.phoneFilterMode = 'all';
    this.currentPage = 1;
    this.clearPageCache();
    this.fetchLeads();
  }

  goToPage(page: number): void {
    const totalPages = this.meta.total_pages || 1;
    if (page < 1 || page > totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.fetchLeads();
  }
  /** Step 2: computed only when page/totalPages changes */
  private updateDisplayedPages(): void {
    const totalPages = this.meta.total_pages || 1;
    const current = this.currentPage;
    const pages: number[] = [];
    let start = Math.max(1, current - 2);
    let end = Math.min(totalPages, current + 2);
    if (current <= 3) end = Math.min(totalPages, 5);
    if (current >= totalPages - 2) start = Math.max(1, totalPages - 4);
    for (let i = start; i <= end; i++) pages.push(i);
    this.cachedDisplayedPages = pages;
  }
  openLeadDetail(lead: LeadItem): void {
    this.selectedLead = lead;
    this.isDetailModalOpen = true;
    this.cdr.markForCheck();
  }

  closeLeadDetail(): void {
    this.isDetailModalOpen = false;
    this.selectedLead = null;
    this.cdr.markForCheck();
  }

  copyToClipboard(text: string, fieldName: string): void {
    if (!text) return;
    navigator.clipboard.writeText(text);
    this.copiedField = fieldName;
    this.cdr.markForCheck();
    setTimeout(() => {
      this.copiedField = '';
      this.cdr.markForCheck();
    }, 2000);
  }

  getCellValue(lead: LeadItem, key: string): string {
    const val = (lead as unknown as Record<string, unknown>)[key];
    return val !== null && val !== undefined && val !== '' ? String(val) : '—';
  }

  exportCsv(): void {
    if (!this.selectedModuleKey || this.isExporting) return;

    this.isExporting = true;
    this.cdr.markForCheck();

    const params: Record<string, unknown> = { module: this.selectedModuleKey };
    if (this.searchTerm.trim()) params['search'] = this.searchTerm.trim();
    if (this.dateFrom) params['date_from'] = this.dateFrom;
    if (this.dateTo) params['date_to'] = this.dateTo;

    this.leadService.exportLeads(params as any).subscribe({
      next: (blob) => {
        this.isExporting = false;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `leads_${this.selectedModuleKey}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.showToast('Lead export downloaded successfully.', 'success');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isExporting = false;
        this.showToast('Failed to export leads.', 'error');
        this.cdr.markForCheck();
        console.error('Export error:', err);
      },
    });
  }

  showToast(message: string, type: 'success' | 'error' = 'success'): void {
    if (type === 'success') {
      this.toastService.success(message);
    } else {
      this.toastService.error(message);
    }
  }
}