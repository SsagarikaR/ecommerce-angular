import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { BrandForm } from './brand-form';
import { Brand } from '../../../services/brand/brand';
import { Toast } from '../../../services/toast/toast';
import { CloudinaryUploadComponent } from '../../../components/shared/cloudinary-upload-component/cloudinary-upload-component';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('BrandForm', () => {
  let component: BrandForm;
  let fixture: ComponentFixture<BrandForm>;
  let mockBrandService: jasmine.SpyObj<Brand>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockToast: jasmine.SpyObj<Toast>;
  let mockActivatedRoute: { snapshot: { paramMap: Map<string, string> } };

  const mockBrand = {
    brandID: 1,
    brandName: 'Test Brand',
    brandThumbnail: 'http://test-thumbnail.jpg',
  };

  beforeEach(async () => {
    mockBrandService = jasmine.createSpyObj('Brand', [
      'getBrands',
      'postBrands',
      'updateBrands',
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigateByUrl']);
    mockToast = jasmine.createSpyObj('Toast', ['show']);
    mockActivatedRoute = { snapshot: { paramMap: new Map() } };

    await TestBed.configureTestingModule({
      imports: [BrandForm, FormsModule, CommonModule, HttpClientTestingModule],
      providers: [
        { provide: Brand, useValue: mockBrandService },
        { provide: Router, useValue: mockRouter },
        { provide: Toast, useValue: mockToast },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandForm);
    component = fixture.componentInstance;
  });

  // Test Case 1: Initial State (Add Mode)
  it('should initialize in add mode and show "Add New Brand" title', () => {
    fixture.detectChanges();
    expect(component.isEdit).toBeFalse();
    const titleElement = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(titleElement.textContent.trim()).toBe('Add New Brand');
  });

  // Test Case 2: Edit Mode Initialization
  it('should initialize in edit mode and load brand data', fakeAsync(() => {
    mockActivatedRoute.snapshot.paramMap = new Map([['id', '1']]);
    mockBrandService.getBrands.and.returnValue(of([mockBrand]));

    fixture.detectChanges();
    tick();

    expect(component.isEdit).toBeTrue();
    expect(component.brandID).toBe(1);
    expect(component.brandName).toBe(mockBrand.brandName);
    expect(component.brandThumbnail).toBe(mockBrand.brandThumbnail);
    expect(mockBrandService.getBrands).toHaveBeenCalledWith({ brandID: 1 });
    const titleElement = fixture.debugElement.query(By.css('h1')).nativeElement;
    expect(titleElement.textContent.trim()).toBe('Update Brand');
  }));

  // Test Case 3: Edit Mode (Brand Not Found)
  it('should show an error toast and navigate away if brand is not found', fakeAsync(() => {
    mockActivatedRoute.snapshot.paramMap = new Map([['id', '1']]);
    mockBrandService.getBrands.and.returnValue(of([]));

    fixture.detectChanges();
    tick();

    expect(mockToast.show).toHaveBeenCalledWith('Brand not found.', 'error');
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/admin/brands');
  }));

  // Test Case 4: Edit Mode (API Error)
  it('should show an error toast and navigate away on API error', fakeAsync(() => {
    mockActivatedRoute.snapshot.paramMap = new Map([['id', '1']]);
    mockBrandService.getBrands.and.returnValue(throwError(() => 'API Error'));

    fixture.detectChanges();
    tick();

    expect(mockToast.show).toHaveBeenCalledWith(
      'Error loading brand details.',
      'error'
    );
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/admin/brands');
  }));

  // Test Case 5: Add Brand
  it('should call postBrands and navigate on successful add', fakeAsync(() => {
    mockBrandService.postBrands.and.returnValue(of({}));
    component.brandName = 'New Brand';
    component.brandThumbnail = 'http://new-thumbnail.jpg';

    fixture.detectChanges();
    const saveButton = fixture.debugElement.query(
      By.css('button.bg-slate-600')
    );
    saveButton.nativeElement.click();
    tick();

    expect(mockBrandService.postBrands).toHaveBeenCalledWith({
      brandName: 'New Brand',
      brandThumbnail: 'http://new-thumbnail.jpg',
    });
    expect(mockToast.show).toHaveBeenCalledWith(
      'Brand added successfully!',
      'success'
    );
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/admin/brands');
  }));

  // Test Case 6: Update Brand
  it('should call updateBrands and navigate on successful update', fakeAsync(() => {
    mockBrandService.updateBrands.and.returnValue(of({}));
    component.isEdit = true;
    component.brandID = 1;
    component.brandName = 'Updated Brand';
    component.brandThumbnail = 'http://updated-thumbnail.jpg';

    fixture.detectChanges();
    const saveButton = fixture.debugElement.query(
      By.css('button.bg-slate-600')
    );
    saveButton.nativeElement.click();
    tick();

    expect(mockBrandService.updateBrands).toHaveBeenCalledWith({
      brandID: 1,
      brandName: 'Updated Brand',
      brandThumbnail: 'http://updated-thumbnail.jpg',
    });
    expect(mockToast.show).toHaveBeenCalledWith(
      'Brand updated successfully!',
      'success'
    );
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/admin/brands');
  }));

  // Test Case 8: Cancel Button
  it('should navigate to brands list on cancel', () => {
    const cancelButton = fixture.debugElement.query(
      By.css('button.border-slate-400')
    );
    cancelButton.nativeElement.click();

    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/admin/brands');
  });

  // Test Case 9: Cloudinary Upload Integration
  it('should update brandThumbnail when the cloudinary component emits uploadSuccess', () => {
    const testUrl = 'http://new-cloudinary-url.jpg';
    const cloudinaryComponent = fixture.debugElement.query(
      By.directive(CloudinaryUploadComponent)
    ).componentInstance;

    cloudinaryComponent.uploadSuccess.emit({
      url: testUrl,
      publicId: '',
      originalFilename: '',
      format: '',
      bytes: 0,
    });

    expect(component.brandThumbnail).toBe(testUrl);
  });
});
