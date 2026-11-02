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
import {
  ColumnConfig,
  CustomAnalysisFilterParams,
} from './models/lead-analysis.model';
import {
  computeNameCounts,
  computePhoneCounts,
  isTestLead,
  normalizeName,
  normalizePhone,
} from './utils/lead-filters.util';
import { LeadAnalyticsBarComponent } from './components/lead-analytics-bar/lead-analytics-bar.component';
import { CustomAnalysisModalComponent } from './components/custom-analysis-modal/custom-analysis-modal.component';

export type { ColumnConfig };

@Component({
  selector: 'app-leads',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    TopbarComponent,
    SidebarComponent,
    DateRangePickerComponent,
    LeadAnalyticsBarComponent,
    CustomAnalysisModalComponent,
  ],
  templateUrl: './leads.component.html',
})
export class LeadsComponent implements OnInit, OnDestroy {
  private readonly leadService = inject(LeadService);
  private readonly toastService = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  protected readonly cdr = inject(ChangeDetectorRef);

  private routeSub?: Subscription;
  private fetchSub?: Subscription;
  private searchSubject = new Subject<string>();
  private searchSub?: Subscription;
  private dateSubject = new Subject<void>();
  private dateSub?: Subscription;
  private readonly fetchTrigger$ = new Subject<Record<string, unknown>>();
  private pageCache = new Map<string, { leads: LeadItem[]; meta: LeadMeta }>();
  private currentCacheKey = '';

  readonly skeletonRows = Array(10).fill(0);

  // Lead modules
  modules: LeadModule[] = [];
  selectedModuleKey = '';
  isLoadingModules = false;

  // Leads data
  leads: LeadItem[] = [];
  meta: LeadMeta = { page: 1, per_page: 25, total: 0, filtered: 0, total_pages: 1 };
  isLoadingLeads = false;
  loadError = '';

  // Query & Filter state
  searchTerm = '';
  dateFrom = '';
  dateTo = '';
  perPage = 25;
  currentPage = 1;
  isExporting = false;

  // Columns & dropdown
  isColumnsDropdownOpen = false;
  private readonly STORAGE_KEY = 'leads_column_prefs';
  private readonly WIDTHS_STORAGE_KEY = 'leads_column_widths';

  // Frontend Quality & Deduplication Filters
  excludeTestLeads = false;
  testKeyword = 'test';
  phoneFilterMode: 'all' | 'unique' | 'duplicates_only' = 'all';
  nameFilterMode: 'all' | 'unique' | 'duplicates_only' = 'all';
  sortKey: string | null = null;
  sortOrder: 'asc' | 'desc' | null = null;
  isFilterMenuOpen = false;

  // Analytics & Custom Analysis popup state
  isAnalyticsBarOpen = true;
  isCustomAnalysisOpen = false;

  readonly defaultColumns: ColumnConfig[] = [
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
  ];

  columns: ColumnConfig[] = this.defaultColumns.map((c) => ({ ...c }));
  draggedColIndex: number | null = null;
  dragOverColIndex: number | null = null;

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
  private startWidth = 0;

  colVisibility: Record<string, boolean> = {};
  visibleColumns: ColumnConfig[] = [];
  visibleColumnCount = 0;
  activeModuleLabel = '';
  cachedDisplayedPages: number[] = [];

  get activeModule(): LeadModule | undefined {
    return this.modules.find((m) => m.key === this.selectedModuleKey);
  }

  ngOnInit(): void {
    this.loadColumnPrefs();
    this.loadColWidths();
    this.updateColumnCache();

    this.fetchSub = this.fetchTrigger$
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
          };
          this.pageCache.set(this.currentCacheKey, {
            leads: this.leads,
            meta: this.meta,
          });
        } else {
          this.leads = [];
          this.loadError = response.message || 'Unable to load leads.';
        }
        this.updateDisplayedPages();
        this.cdr.markForCheck();
      });

    this.searchSub = this.searchSubject
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe((term) => {
        this.searchTerm = term;
        this.currentPage = 1;
        this.clearPageCache();
        this.fetchLeads();
      });

    this.dateSub = this.dateSubject
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
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.order)) {
          const map = new Map(this.defaultColumns.map((c) => [c.key, { ...c }]));
          const reordered: ColumnConfig[] = [];
          for (const key of parsed.order) {
            const col = map.get(key);
            if (col) {
              if (parsed.visibility && parsed.visibility[key] !== undefined) {
                col.visible = Boolean(parsed.visibility[key]);
              }
              reordered.push(col);
              map.delete(key);
            }
          }
          // Append any remaining default columns that might not have been in saved order
          for (const col of map.values()) {
            if (parsed.visibility && parsed.visibility[col.key] !== undefined) {
              col.visible = Boolean(parsed.visibility[col.key]);
            }
            reordered.push(col);
          }
          this.columns = reordered;
        } else if (parsed && typeof parsed === 'object') {
          // Legacy format: Record<string, boolean>
          this.columns = this.defaultColumns.map((c) => ({
            ...c,
            visible: parsed[c.key] !== undefined ? Boolean(parsed[c.key]) : c.visible,
          }));
        }
      }
    } catch {}
  }

  private saveColumnPrefs(): void {
    try {
      const prefs = {
        order: this.columns.map((c) => c.key),
        visibility: this.columns.reduce(
          (acc, c) => {
            acc[c.key] = c.visible;
            return acc;
          },
          {} as Record<string, boolean>
        ),
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefs));
    } catch {}
  }

  onColumnDragStart(event: DragEvent, index: number): void {
    this.draggedColIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', index.toString());
    }
  }

  onColumnDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (this.draggedColIndex === null) return;
    if (this.dragOverColIndex !== index) {
      this.dragOverColIndex = index;
      this.cdr.markForCheck();
    }
  }

  onColumnDragLeave(event: DragEvent, index: number): void {
    const target = event.currentTarget as HTMLElement;
    const related = event.relatedTarget as Node | null;
    if (!target.contains(related)) {
      if (this.dragOverColIndex === index) {
        this.dragOverColIndex = null;
        this.cdr.markForCheck();
      }
    }
  }

  onColumnDrop(event: DragEvent, targetIndex: number): void {
    event.preventDefault();
    if (this.draggedColIndex === null || this.draggedColIndex === targetIndex) {
      this.draggedColIndex = null;
      this.dragOverColIndex = null;
      return;
    }

    const item = this.columns.splice(this.draggedColIndex, 1)[0];
    this.columns.splice(targetIndex, 0, item);

    this.draggedColIndex = null;
    this.dragOverColIndex = null;

    this.saveColumnPrefs();
    this.updateColumnCache();
    this.cdr.markForCheck();
  }

  onColumnDragEnd(): void {
    this.draggedColIndex = null;
    this.dragOverColIndex = null;
    this.cdr.markForCheck();
  }

  moveColumn(index: number, direction: 'up' | 'down', event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= this.columns.length) return;

    const item = this.columns.splice(index, 1)[0];
    this.columns.splice(targetIndex, 0, item);

    this.saveColumnPrefs();
    this.updateColumnCache();
    this.cdr.markForCheck();
  }

  resetColumnOrder(): void {
    this.columns = this.defaultColumns.map((c) => ({ ...c }));
    this.saveColumnPrefs();
    this.updateColumnCache();
    this.toastService.success('Column order and visibility reset to default.');
    this.cdr.markForCheck();
  }

  toggleAllColumns(selectAll: boolean): void {
    this.columns.forEach((c) => (c.visible = selectAll));
    if (!selectAll && this.columns.length > 0) {
      this.columns[0].visible = true;
    }
    this.saveColumnPrefs();
    this.updateColumnCache();
    this.cdr.markForCheck();
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
    } catch {}
  }

  private saveColWidths(): void {
    try {
      localStorage.setItem(this.WIDTHS_STORAGE_KEY, JSON.stringify(this.colWidths));
    } catch {}
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
    this.currentCacheKey = this.buildCacheKey();
    const cached = this.pageCache.get(this.currentCacheKey);
    if (cached) {
      this.leads = cached.leads;
      this.meta = cached.meta;
      this.isLoadingLeads = false;
      this.updateDisplayedPages();
      this.cdr.markForCheck();
      return;
    }

    this.isLoadingLeads = true;
    this.cdr.markForCheck();
    this.fetchTrigger$.next(this.buildParams());
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

  isLeadTest(lead: LeadItem): boolean {
    return isTestLead(lead, this.testKeyword);
  }

  get phoneCounts(): Map<string, number> {
    return computePhoneCounts(this.leads);
  }

  getPhoneDuplicateCount(lead: LeadItem): number {
    const p = normalizePhone(lead.phone);
    if (!p) return 0;
    return this.phoneCounts.get(p) || 0;
  }

  get nameCounts(): Map<string, number> {
    return computeNameCounts(this.leads);
  }

  getNameDuplicateCount(lead: LeadItem): number {
    const n = normalizeName(lead.name);
    if (!n) return 0;
    return this.nameCounts.get(n) || 0;
  }

  get displayedLeads(): LeadItem[] {
    let result = this.leads;

    if (this.excludeTestLeads) {
      result = result.filter((lead) => !isTestLead(lead, this.testKeyword));
    }

    if (this.phoneFilterMode === 'unique') {
      const seenPhones = new Set<string>();
      result = result.filter((lead) => {
        const p = normalizePhone(lead.phone);
        if (!p) return true;
        if (seenPhones.has(p)) return false;
        seenPhones.add(p);
        return true;
      });
    } else if (this.phoneFilterMode === 'duplicates_only') {
      const counts = this.phoneCounts;
      result = result.filter((lead) => {
        const p = normalizePhone(lead.phone);
        return p ? (counts.get(p) || 0) > 1 : false;
      });
    }

    if (this.nameFilterMode === 'unique') {
      const seenNames = new Set<string>();
      result = result.filter((lead) => {
        const n = normalizeName(lead.name);
        if (!n) return true;
        if (seenNames.has(n)) return false;
        seenNames.add(n);
        return true;
      });
    } else if (this.nameFilterMode === 'duplicates_only') {
      const counts = this.nameCounts;
      result = result.filter((lead) => {
        const n = normalizeName(lead.name);
        return n ? (counts.get(n) || 0) > 1 : false;
      });
    }

    if (this.sortKey && this.sortOrder) {
      const key = this.sortKey;
      const orderMultiplier = this.sortOrder === 'asc' ? 1 : -1;

      result = [...result].sort((a, b) => {
        if (key === 'entrydate') {
          const timeA = a.entrydate ? new Date(a.entrydate.replace(' ', 'T')).getTime() || 0 : 0;
          const timeB = b.entrydate ? new Date(b.entrydate.replace(' ', 'T')).getTime() || 0 : 0;
          return (timeA - timeB) * orderMultiplier;
        }

        if (key === 'id') {
          const idA = Number(a.id) || 0;
          const idB = Number(b.id) || 0;
          return (idA - idB) * orderMultiplier;
        }

        const valA = (this.getCellValue(a, key) || (a as unknown as Record<string, unknown>)[key] || '')
          .toString()
          .trim()
          .toLowerCase();
        const valB = (this.getCellValue(b, key) || (b as unknown as Record<string, unknown>)[key] || '')
          .toString()
          .trim()
          .toLowerCase();
        return valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' }) * orderMultiplier;
      });
    }

    return result;
  }

  get testLeadsCount(): number {
    return this.leads.filter((l) => isTestLead(l, this.testKeyword)).length;
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

  get duplicateNameCount(): number {
    const counts = this.nameCounts;
    let dupCount = 0;
    for (const count of counts.values()) {
      if (count > 1) {
        dupCount += count;
      }
    }
    return dupCount;
  }

  get hasActiveFrontendFilters(): boolean {
    return (
      this.excludeTestLeads ||
      this.phoneFilterMode !== 'all' ||
      this.nameFilterMode !== 'all' ||
      this.sortKey !== null
    );
  }

  toggleExcludeTestLeads(): void {
    this.excludeTestLeads = !this.excludeTestLeads;
    this.cdr.markForCheck();
  }

  setPhoneFilterMode(mode: 'all' | 'unique' | 'duplicates_only'): void {
    this.phoneFilterMode = mode;
    this.cdr.markForCheck();
  }

  setNameFilterMode(mode: 'all' | 'unique' | 'duplicates_only'): void {
    this.nameFilterMode = mode;
    this.cdr.markForCheck();
  }

  get currentSortOption(): string {
    if (!this.sortKey || !this.sortOrder) return '';
    return `${this.sortKey}_${this.sortOrder}`;
  }

  setSortOption(option: string): void {
    if (!option) {
      this.sortKey = null;
      this.sortOrder = null;
    } else {
      const [key, order] = option.split('_');
      this.sortKey = key;
      this.sortOrder = (order as 'asc' | 'desc') || 'asc';
    }
    this.cdr.markForCheck();
  }

  toggleSort(key: string): void {
    if (this.sortKey !== key) {
      this.sortKey = key;
      this.sortOrder = key === 'entrydate' ? 'desc' : 'asc';
    } else if (this.sortOrder === 'asc') {
      this.sortOrder = 'desc';
    } else if (this.sortOrder === 'desc') {
      this.sortKey = null;
      this.sortOrder = null;
    } else {
      this.sortOrder = 'asc';
    }
    this.cdr.markForCheck();
  }

  getSortLabel(): string {
    if (!this.sortKey || !this.sortOrder) return '';
    const col = this.columns.find((c) => c.key === this.sortKey);
    const label = col ? col.label : this.sortKey;
    if (this.sortKey === 'entrydate') {
      return this.sortOrder === 'desc' ? `${label} (Newest first)` : `${label} (Oldest first)`;
    }
    return this.sortOrder === 'asc' ? `${label} (A → Z)` : `${label} (Z → A)`;
  }

  clearFrontendFilters(): void {
    this.excludeTestLeads = false;
    this.phoneFilterMode = 'all';
    this.nameFilterMode = 'all';
    this.sortKey = null;
    this.sortOrder = null;
    this.cdr.markForCheck();
  }

  toggleAnalyticsBar(): void {
    this.isAnalyticsBarOpen = !this.isAnalyticsBarOpen;
    this.cdr.markForCheck();
  }

  openCustomAnalysis(): void {
    this.isCustomAnalysisOpen = true;
    this.cdr.markForCheck();
  }

  closeCustomAnalysis(): void {
    this.isCustomAnalysisOpen = false;
    this.cdr.markForCheck();
  }

  onApplyCustomAnalysisFilters(params: CustomAnalysisFilterParams): void {
    if (params.dateFrom) this.dateFrom = params.dateFrom;
    if (params.dateTo) this.dateTo = params.dateTo;
    this.excludeTestLeads = params.excludeTest;
    this.phoneFilterMode = params.phoneMode;
    if (params.nameMode) this.nameFilterMode = params.nameMode;
    this.currentPage = 1;
    this.clearPageCache();
    this.fetchLeads();
    this.toastService.success('Applied custom analysis filters to leads table.');
    this.cdr.markForCheck();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.dateFrom = '';
    this.dateTo = '';
    this.excludeTestLeads = false;
    this.phoneFilterMode = 'all';
    this.nameFilterMode = 'all';
    this.sortKey = null;
    this.sortOrder = null;
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
        this.toastService.success('Lead export downloaded successfully.');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isExporting = false;
        this.toastService.error('Failed to export leads.');
        this.cdr.markForCheck();
        console.error('Export error:', err);
      },
    });
  }
}