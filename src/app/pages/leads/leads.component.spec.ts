import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { LeadsComponent } from './leads.component';
import { LeadItem } from '../../services/lead.service';

describe('LeadsComponent', () => {
  let component: LeadsComponent;
  let fixture: ComponentFixture<LeadsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadsComponent],
      providers: [provideRouter([]), provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(LeadsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Name Duplicate Filter', () => {
    const mockLeads: LeadItem[] = [
      {
        id: 1,
        name: 'Rahul Sharma',
        phone: '9876543210',
        entrydate: '2026-03-01 10:00:00',
        parent_email: 'rahul1@example.com',
        otp_validation: 'VALID',
      },
      {
        id: 2,
        name: 'rahul  sharma',
        phone: '9876543211',
        entrydate: '2026-03-01 11:00:00',
        parent_email: 'rahul2@example.com',
        otp_validation: 'VALID',
      },
      {
        id: 3,
        name: 'Priya Patel',
        phone: '9876543212',
        entrydate: '2026-03-01 12:00:00',
        parent_email: 'priya@example.com',
        otp_validation: 'VALID',
      },
      {
        id: 4,
        name: 'Anita Verma',
        phone: '9876543213',
        entrydate: '2026-03-01 13:00:00',
        parent_email: 'anita@example.com',
        otp_validation: 'VALID',
      },
    ];

    beforeEach(() => {
      component.leads = [...mockLeads];
    });

    it('should default nameFilterMode to "all"', () => {
      expect(component.nameFilterMode).toBe('all');
      expect(component.displayedLeads.length).toBe(4);
    });

    it('should calculate duplicateNameCount correctly', () => {
      // Rahul Sharma appears twice (case and extra spaces normalized)
      expect(component.duplicateNameCount).toBe(2);
      expect(component.getNameDuplicateCount(mockLeads[0])).toBe(2);
      expect(component.getNameDuplicateCount(mockLeads[1])).toBe(2);
      expect(component.getNameDuplicateCount(mockLeads[2])).toBe(1);
    });

    it('should filter displayed leads to unique names when mode is "unique"', () => {
      component.setNameFilterMode('unique');
      expect(component.nameFilterMode).toBe('unique');
      expect(component.displayedLeads.length).toBe(3);
      const names = component.displayedLeads.map((l) => l.name);
      expect(names).toEqual(['Rahul Sharma', 'Priya Patel', 'Anita Verma']);
    });

    it('should filter displayed leads to only duplicate names when mode is "duplicates_only"', () => {
      component.setNameFilterMode('duplicates_only');
      expect(component.nameFilterMode).toBe('duplicates_only');
      expect(component.displayedLeads.length).toBe(2);
      expect(component.displayedLeads.map((l) => l.id)).toEqual([1, 2]);
    });

    it('should consider nameFilterMode in hasActiveFrontendFilters', () => {
      expect(component.hasActiveFrontendFilters).toBe(false);
      component.setNameFilterMode('unique');
      expect(component.hasActiveFrontendFilters).toBe(true);
      component.setNameFilterMode('all');
      expect(component.hasActiveFrontendFilters).toBe(false);
    });

    it('should reset nameFilterMode in clearFrontendFilters', () => {
      component.setNameFilterMode('duplicates_only');
      component.clearFrontendFilters();
      expect(component.nameFilterMode).toBe('all');
    });

    it('should reset nameFilterMode in resetFilters', () => {
      component.setNameFilterMode('unique');
      component.resetFilters();
      expect(component.nameFilterMode).toBe('all');
    });
  });

  describe('Column Customization & Reordering', () => {
    beforeEach(() => {
      localStorage.clear();
      component.resetColumnOrder();
    });

    it('should move column down and update order', () => {
      // Default: ['id', 'entrydate', 'name', ...]
      expect(component.columns[0].key).toBe('id');
      expect(component.columns[1].key).toBe('entrydate');

      component.moveColumn(0, 'down');

      expect(component.columns[0].key).toBe('entrydate');
      expect(component.columns[1].key).toBe('id');
      expect(component.visibleColumns[0].key).toBe('entrydate');
      expect(component.visibleColumns[1].key).toBe('id');
    });

    it('should move column up and update order', () => {
      component.moveColumn(1, 'up');

      expect(component.columns[0].key).toBe('entrydate');
      expect(component.columns[1].key).toBe('id');
    });

    it('should reorder columns on drop', () => {
      component.draggedColIndex = 0; // 'id'
      const fakeEvent = { preventDefault: () => {} } as DragEvent;

      component.onColumnDrop(fakeEvent, 2); // Move 'id' to index 2

      expect(component.columns[0].key).toBe('entrydate');
      expect(component.columns[1].key).toBe('name');
      expect(component.columns[2].key).toBe('id');
      expect(component.draggedColIndex).toBeNull();
    });

    it('should save column order and visibility to localStorage and restore on init', () => {
      // Custom order: move 'name' to the first position
      component.moveColumn(2, 'up'); // name is now at 1
      component.moveColumn(1, 'up'); // name is now at 0
      component.toggleColumn('phone'); // phone is now toggled

      const saved = localStorage.getItem('leads_column_prefs');
      expect(saved).toBeTruthy();
      const parsed = JSON.parse(saved!);
      expect(parsed.order[0]).toBe('name');
      expect(parsed.visibility['name']).toBe(true);

      // Create new component instance to simulate page reload
      const newFixture = TestBed.createComponent(LeadsComponent);
      const newComp = newFixture.componentInstance;
      newComp.ngOnInit();

      expect(newComp.columns[0].key).toBe('name');
      expect(newComp.columns.find((c) => c.key === 'phone')?.visible).toBe(
        component.columns.find((c) => c.key === 'phone')?.visible
      );
    });

    it('should reset column order and visibility when resetColumnOrder is called', () => {
      component.moveColumn(0, 'down');
      expect(component.columns[0].key).not.toBe('id');

      component.resetColumnOrder();

      expect(component.columns[0].key).toBe('id');
      expect(component.columns[1].key).toBe('entrydate');
    });

    it('should toggle all columns visibility', () => {
      component.toggleAllColumns(false);
      // At least 1 column (ID) should remain visible
      expect(component.visibleColumnCount).toBe(1);

      component.toggleAllColumns(true);
      expect(component.visibleColumnCount).toBe(component.columns.length);
    });
  });

  describe('Date & Name Sorting', () => {
    const sortTestLeads: LeadItem[] = [
      {
        id: 1,
        name: 'Zoya Khan',
        entrydate: '2026-03-01 10:00:00',
        phone: '9876543210',
        parent_email: 'zoya@example.com',
        otp_validation: 'VALID',
      },
      {
        id: 2,
        name: 'Aarav Patel',
        entrydate: '2026-03-03 14:00:00',
        phone: '9876543211',
        parent_email: 'aarav@example.com',
        otp_validation: 'VALID',
      },
      {
        id: 3,
        name: 'Manish Verma',
        entrydate: '2026-03-02 12:00:00',
        phone: '9876543212',
        parent_email: 'manish@example.com',
        otp_validation: 'VALID',
      },
    ];

    beforeEach(() => {
      component.leads = [...sortTestLeads];
      component.sortKey = null;
      component.sortOrder = null;
    });

    it('should sort by name ascending (A to Z)', () => {
      component.setSortOption('name_asc');
      expect(component.sortKey).toBe('name');
      expect(component.sortOrder).toBe('asc');
      expect(component.displayedLeads.map((l) => l.name)).toEqual([
        'Aarav Patel',
        'Manish Verma',
        'Zoya Khan',
      ]);
    });

    it('should sort by name descending (Z to A)', () => {
      component.setSortOption('name_desc');
      expect(component.sortKey).toBe('name');
      expect(component.sortOrder).toBe('desc');
      expect(component.displayedLeads.map((l) => l.name)).toEqual([
        'Zoya Khan',
        'Manish Verma',
        'Aarav Patel',
      ]);
    });

    it('should sort by date newest first (descending)', () => {
      component.setSortOption('entrydate_desc');
      expect(component.displayedLeads.map((l) => l.id)).toEqual([2, 3, 1]);
    });

    it('should sort by date oldest first (ascending)', () => {
      component.setSortOption('entrydate_asc');
      expect(component.displayedLeads.map((l) => l.id)).toEqual([1, 3, 2]);
    });

    it('should cycle sort states when clicking header via toggleSort', () => {
      // First click on name -> asc
      component.toggleSort('name');
      expect(component.sortKey).toBe('name');
      expect(component.sortOrder).toBe('asc');

      // Second click on name -> desc
      component.toggleSort('name');
      expect(component.sortKey).toBe('name');
      expect(component.sortOrder).toBe('desc');

      // Third click on name -> clear
      component.toggleSort('name');
      expect(component.sortKey).toBeNull();
      expect(component.sortOrder).toBeNull();

      // Click on date -> defaults to desc (newest first)
      component.toggleSort('entrydate');
      expect(component.sortKey).toBe('entrydate');
      expect(component.sortOrder).toBe('desc');
    });

    it('should reset sort on resetFilters and clearFrontendFilters', () => {
      component.setSortOption('name_asc');
      expect(component.hasActiveFrontendFilters).toBe(true);

      component.clearFrontendFilters();
      expect(component.sortKey).toBeNull();
      expect(component.sortOrder).toBeNull();

      component.setSortOption('entrydate_desc');
      component.resetFilters();
      expect(component.sortKey).toBeNull();
      expect(component.sortOrder).toBeNull();
    });
  });
});
