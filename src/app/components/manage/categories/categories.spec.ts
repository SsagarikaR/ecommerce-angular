import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { of, throwError, Subject, firstValueFrom } from 'rxjs';
import { Categories } from './categories';
import { Category } from '../../../services/category/category';
import { DialogService } from '../../../services/dialog/dialog';
import { CategroyData } from '../../../types/type';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink, provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

// Mock data for categories
const MOCK_CATEGORIES: CategroyData[] = Array.from({ length: 11 }, (_, i) => ({
  categoryID: i + 1,
  categoryName: `Category ${String.fromCharCode(90 - i)}`, // Sorts in reverse alphabetical order initially
  categoryThumbnail: `thumb${i + 1}.jpg`,
}));

// Mock services
class MockCategoryService {
  getCategories() {
    return of(MOCK_CATEGORIES);
  }
  deleteCategory(id: number) {
    return of({});
  }
}

class MockDialogService {
  confirmed$ = new Subject<boolean>();
  open() {
    return { afterClosed: () => this.confirmed$.asObservable() };
  }
}

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

describe('Categories', () => {
  let component: Categories;
  let fixture: ComponentFixture<Categories>;
  let categoryService: Category;
  let snackBar: MatSnackBar;
  let dialogService: MockDialogService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        Categories,
        MatSnackBarModule,
        MatIconModule,
        MatCheckboxModule,
        FormsModule,
      ],
      providers: [
        { provide: Category, useClass: MockCategoryService },
        { provide: MatSnackBar, useValue: { open: jasmine.createSpy('open') } },
        { provide: DialogService, useClass: MockDialogService },
        { provide: Router, useClass: MockRouter },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Categories);
    component = fixture.componentInstance;
    categoryService = TestBed.inject(Category);
    snackBar = TestBed.inject(MatSnackBar);
    dialogService = TestBed.inject(
      DialogService
    ) as unknown as MockDialogService;
    router = TestBed.inject(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories successfully on initialization', fakeAsync(() => {
    const getCategoriesSpy = spyOn(
      categoryService,
      'getCategories'
    ).and.callThrough();
    fixture.detectChanges();
    tick();

    expect(getCategoriesSpy).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(component.categories.length).toBe(11);
    expect(component.totalCategories).toBe(11);
    expect(component.filteredCategories.length).toBe(10);
  }));

  it('should filter categories based on search term', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    component.searchTerm = 'Category S';
    component.onSearch({ target: { value: 'Category S' } } as any);
    tick();
    fixture.detectChanges();

    expect(component.filteredCategories.length).toBe(1);
    expect(component.filteredCategories[0].categoryName).toBe('Category S');
  }));

  it('should correctly select and deselect categories', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    // Select a single category
    component.toggleCategorySelection(MOCK_CATEGORIES[0].categoryID);
    expect(
      component.selectedCategories.has(MOCK_CATEGORIES[0].categoryID)
    ).toBeTrue();

    // Deselect the same category
    component.toggleCategorySelection(MOCK_CATEGORIES[0].categoryID);
    expect(
      component.selectedCategories.has(MOCK_CATEGORIES[0].categoryID)
    ).toBeFalse();

    // Select all categories
    component.toggleSelectAll();
    expect(component.selectedCategories.size).toBe(10);
    expect(component.isAllSelected()).toBeTrue();

    // Deselect all categories
    component.toggleSelectAll();
    expect(component.selectedCategories.size).toBe(0);
    expect(component.isAllSelected()).toBeFalse();
  }));

  it('should call deleteCategory for a single item after confirming delete', fakeAsync(() => {
    const deleteSpy = spyOn(categoryService, 'deleteCategory').and.returnValue(
      of({})
    );
    const loadSpy = spyOn(component, 'loadCategories').and.callThrough();
    spyOn(dialogService, 'open').and.callThrough();

    component.confirmDelete(MOCK_CATEGORIES[0], new Event('click'));
    dialogService.confirmed$.next(true);
    tick();
    fixture.detectChanges();

    expect(deleteSpy).toHaveBeenCalledWith(MOCK_CATEGORIES[0].categoryID);
    expect(snackBar.open).toHaveBeenCalledWith(
      'Category deleted successfully',
      'Close',
      jasmine.any(Object)
    );
    expect(loadSpy).toHaveBeenCalled();
  }));

  it('should call deleteCategory for selected items after confirming bulk delete', fakeAsync(() => {
    const deleteSpy = spyOn(categoryService, 'deleteCategory').and.returnValue(
      of({})
    );
    const loadSpy = spyOn(component, 'loadCategories').and.callThrough();
    spyOn(dialogService, 'open').and.callThrough();

    component.selectedCategories.add(MOCK_CATEGORIES[0].categoryID);
    component.selectedCategories.add(MOCK_CATEGORIES[1].categoryID);

    component.bulkDelete();
    dialogService.confirmed$.next(true);
    tick();
    fixture.detectChanges();

    expect(deleteSpy).toHaveBeenCalledTimes(2);
    expect(deleteSpy).toHaveBeenCalledWith(MOCK_CATEGORIES[0].categoryID);
    expect(deleteSpy).toHaveBeenCalledWith(MOCK_CATEGORIES[1].categoryID);
    expect(snackBar.open).toHaveBeenCalledWith(
      '2 categories deleted successfully',
      'Close',
      jasmine.any(Object)
    );
    expect(component.selectedCategories.size).toBe(0);
    expect(loadSpy).toHaveBeenCalled();
  }));
});
