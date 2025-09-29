import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { CategoryForm } from './category-form';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { Category } from '../../../services/category/category';
import { Toast } from '../../../services/toast/toast';
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Mock the CloudinaryUploadComponent
@Component({
  selector: 'app-cloudinary-upload-component',
  template: '',
  standalone: true,
})
class MockCloudinaryUploadComponent {
  @Input() config: any;
  @Input() placeholder: string | undefined;
  @Input() showInfo: boolean = false;
  @Input() imageUrl: string | undefined;
  @Output() uploadSuccess = new EventEmitter<{ url: string }>();
  @Input() ngModel: any;
}

// Mock services
class MockCategoryService {
  getCategories(params: any) {
    return of([
      {
        categoryID: 1,
        categoryName: 'Test Category',
        categoryThumbnail: 'test-thumb.jpg',
      },
    ]);
  }
  postCategories(data: any) {
    return of({ success: true, ...data });
  }
  updateCategories(data: any) {
    return of({ success: true, ...data });
  }
}

class MockRouter {
  navigateByUrl = jasmine.createSpy('navigateByUrl');
}

class MockActivatedRoute {
  snapshot = {
    params: {},
  };
}

class MockToast {
  show = jasmine.createSpy('show');
}

describe('CategoryForm', () => {
  let component: CategoryForm;
  let fixture: ComponentFixture<CategoryForm>;
  let categoryService: MockCategoryService;
  let router: MockRouter;
  let toast: MockToast;
  let activatedRoute: MockActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CategoryForm,
        FormsModule,
        MatButtonModule,
        MockCloudinaryUploadComponent,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Category, useClass: MockCategoryService },
        { provide: Router, useClass: MockRouter },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        { provide: Toast, useClass: MockToast },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryForm);
    component = fixture.componentInstance;
    categoryService = TestBed.inject(
      Category
    ) as unknown as MockCategoryService;
    router = TestBed.inject(Router) as unknown as MockRouter;
    toast = TestBed.inject(Toast) as unknown as MockToast;
    activatedRoute = TestBed.inject(
      ActivatedRoute
    ) as unknown as MockActivatedRoute;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in "add" mode on init without an ID', () => {
    fixture.detectChanges();
    expect(component.isEdit).toBeFalse();
  });

  it('should be in "edit" mode and load data on init with an ID', fakeAsync(() => {
    activatedRoute.snapshot.params = { id: 1 };
    spyOn(categoryService, 'getCategories').and.callThrough();

    component.ngOnInit();
    tick(); // Wait for the observable to resolve
    fixture.detectChanges();

    expect(component.isEdit).toBeTrue();
    expect(categoryService.getCategories).toHaveBeenCalledWith({
      categoryID: 1,
    });
    expect(component.name).toBe('Test Category');
    expect(component.thumbnail).toBe('test-thumb.jpg');
  }));

  it('should add a new category', fakeAsync(() => {
    const postSpy = spyOn(categoryService, 'postCategories').and.callThrough();
    component.name = 'New Ring';
    component.thumbnail = 'new-ring.jpg';
    fixture.detectChanges();

    component.add();
    tick();

    expect(postSpy).toHaveBeenCalledWith({
      categoryName: 'New Ring',
      categoryThumbnail: 'new-ring.jpg',
    });
    expect(toast.show).toHaveBeenCalledWith('Category Added Successfully!');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/categories');
  }));

  it('should update an existing category', fakeAsync(() => {
    const updateSpy = spyOn(
      categoryService,
      'updateCategories'
    ).and.callThrough();
    component.isEdit = true;
    component.categoryID = 1;
    component.name = 'Updated Ring';
    component.thumbnail = 'updated-ring.jpg';
    fixture.detectChanges();

    component.update();
    tick();

    expect(updateSpy).toHaveBeenCalledWith({
      categoryID: 1,
      categoryName: 'Updated Ring',
      categoryThumbnail: 'updated-ring.jpg',
    });
    expect(toast.show).toHaveBeenCalledWith('Category Updated Successfully!');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/categories');
  }));

  it('should navigate back on cancel', () => {
    component.cancel();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/categories');
  });

  it('should disable the add button if fields are empty', () => {
    component.isEdit = false;
    component.name = '';
    component.thumbnail = '';
    fixture.detectChanges();

    const addButton = fixture.debugElement.query(
      By.css('button[type="submit"]')
    );
    expect(addButton).toBeFalsy(); // The button is rendered conditionally, but a quick way to check is this.

    const addDisabledButton = fixture.debugElement.query(
      By.css('.bg-slate-600')
    );
    expect(addDisabledButton.properties['disabled']).toBeTrue();
  });

  it('should enable the add button when fields are filled', () => {
    component.isEdit = false;
    component.name = 'Test Name';
    component.thumbnail = 'test-image.jpg';
    fixture.detectChanges();

    const addButton = fixture.debugElement.query(By.css('button.bg-slate-600'));
    expect(addButton).toBeTruthy();
    expect(addButton.properties['disabled']).toBeFalse();
  });
});
