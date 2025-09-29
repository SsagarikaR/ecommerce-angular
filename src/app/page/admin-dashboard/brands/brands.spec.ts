import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Brands, BrandData } from './brands';
import { Brand } from '../../../services/brand/brand';
import { DialogService } from '../../../services/dialog/dialog';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

describe('Brands', () => {
  let component: Brands;
  let fixture: ComponentFixture<Brands>;
  let mockBrandService: jasmine.SpyObj<Brand>;
  let mockDialogService: jasmine.SpyObj<DialogService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;
  const mockDialogConfirmedSubject = new Subject<boolean>();

  const MOCK_BRANDS: BrandData[] = [
    { brandID: 1, brandName: 'Brand A', brandThumbnail: 'url-a' },
    { brandID: 2, brandName: 'Brand B', brandThumbnail: 'url-b' },
    { brandID: 3, brandName: 'Another Brand C', brandThumbnail: 'url-c' },
  ];

  beforeEach(async () => {
    mockBrandService = jasmine.createSpyObj('Brand', [
      'getBrands',
      'deleteBrands',
    ]);
    mockDialogService = jasmine.createSpyObj('DialogService', ['open'], {
      confirmed$: mockDialogConfirmedSubject.asObservable(),
    });
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        Brands,
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatCheckboxModule,
        FormsModule,
        RouterLink,
      ],
      providers: [
        { provide: Brand, useValue: mockBrandService },
        { provide: DialogService, useValue: mockDialogService },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Brands);
    component = fixture.componentInstance;
  });

  // Test Case 1: Initial state and successful data loading
  it('should load brands successfully on initialization', fakeAsync(() => {
    mockBrandService.getBrands.and.returnValue(of(MOCK_BRANDS));

    fixture.detectChanges();
    tick();

    expect(component.isLoading).toBeFalse();
    expect(component.brands.length).toBe(3);
    expect(component.filteredBrands.length).toBe(3);
    expect(component.totalBrands).toBe(3);
    expect(mockBrandService.getBrands).toHaveBeenCalled();
  }));

  // Test Case 2: Error handling during data load
  it('should handle error when loading brands fails', fakeAsync(() => {
    mockBrandService.getBrands.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    fixture.detectChanges();
    tick();

    expect(component.isLoading).toBeFalse();
    expect(component.brands.length).toBe(0);
    expect(component.filteredBrands.length).toBe(0);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Error loading brands',
      'Close',
      jasmine.any(Object)
    );
  }));

  // Test Case 3: Search functionality
  it('should filter brands based on search term', fakeAsync(() => {
    mockBrandService.getBrands.and.returnValue(of(MOCK_BRANDS));
    fixture.detectChanges();
    tick();

    component.searchTerm = 'another';
    component.applyFiltersAndSort();
    fixture.detectChanges();

    expect(component.filteredBrands.length).toBe(1);
    expect(component.filteredBrands[0].brandName).toBe('Another Brand C');
  }));

  // Test Case 4: Empty search results
  it('should show an empty state when no brands match the search', fakeAsync(() => {
    mockBrandService.getBrands.and.returnValue(of(MOCK_BRANDS));
    fixture.detectChanges();
    tick();

    component.searchTerm = 'xyz';
    component.applyFiltersAndSort();
    fixture.detectChanges();

    const emptyStateDiv = fixture.debugElement.query(By.css('.text-center'));
    expect(emptyStateDiv).toBeTruthy();
    const message = emptyStateDiv.nativeElement.textContent;
    expect(message).toContain('No brands match your search criteria');
  }));

  // Test Case 5: Sorting functionality
  it('should sort brands by name in ascending and descending order', fakeAsync(() => {
    mockBrandService.getBrands.and.returnValue(of(MOCK_BRANDS));
    fixture.detectChanges();
    tick();

    // Sort ascending
    component.sortBrands('brandName');
    fixture.detectChanges();
    expect(component.filteredBrands[0].brandName).toBe('Another Brand C');

    // Sort descending
    component.sortBrands('brandName');
    fixture.detectChanges();
    expect(component.filteredBrands[0].brandName).toBe('Brand B');
  }));

  // Test Case 6: Single and bulk selection
  it('should correctly select and deselect brands', fakeAsync(() => {
    mockBrandService.getBrands.and.returnValue(of(MOCK_BRANDS));
    fixture.detectChanges();
    tick();

    // Select first brand
    component.toggleBrandSelection(1);
    expect(component.selectedBrands.has(1)).toBeTrue();
    expect(component.isIndeterminate()).toBeTrue();

    // Select all brands
    component.toggleSelectAll();
    expect(component.selectedBrands.size).toBe(3);
    expect(component.isAllSelected()).toBeTrue();

    // Deselect all brands
    component.toggleSelectAll();
    expect(component.selectedBrands.size).toBe(0);
    expect(component.isAllSelected()).toBeFalse();
  }));

  // Test Case 7: Bulk delete action with dialog confirmation
  it('should call deleteBrands for selected items after confirming bulk delete', fakeAsync(() => {
    mockBrandService.getBrands.and.returnValue(of(MOCK_BRANDS));
    mockBrandService.deleteBrands.and.returnValue(of({}));
    fixture.detectChanges();
    tick();

    // Select a few brands
    component.toggleBrandSelection(1);
    component.toggleBrandSelection(2);
    fixture.detectChanges();

    // Trigger bulk delete
    component.bulkDelete();
    expect(mockDialogService.open).toHaveBeenCalled();

    // Confirm the dialog
    mockDialogConfirmedSubject.next(true);
    tick();

    // Check if delete was called for each selected brand
    expect(mockBrandService.deleteBrands).toHaveBeenCalledTimes(2);
    expect(mockBrandService.deleteBrands).toHaveBeenCalledWith(1);
    expect(mockBrandService.deleteBrands).toHaveBeenCalledWith(2);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      '2 brands deleted successfully',
      'Close',
      jasmine.any(Object)
    );
  }));

  // Test Case 8: Navigation for edit
  it('should navigate to the edit page when the edit button is clicked', () => {
    const mockBrand = MOCK_BRANDS[0];
    component.editBrand(mockBrand, new Event('click'));
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/admin/brands/',
      mockBrand.brandID,
    ]);
  });
});
