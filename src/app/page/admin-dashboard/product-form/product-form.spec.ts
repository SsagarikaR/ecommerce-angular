import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ProductForm } from './product-form';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Product } from '../../../services/product/product';
import { Category } from '../../../services/category/category';
import { Brand } from '../../../services/brand/brand';
import { Toast } from '../../../services/toast/toast';
import { Component, Input, EventEmitter, Output } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

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
  @Input() ngModel: any;
  @Output() ngModelChange = new EventEmitter<any>();
  @Output() uploadSuccess = new EventEmitter<{ url: string }>();
}

// Mock services
class MockProductService {
  get(params: any) {
    return of([
      {
        productID: 1,
        productName: 'Test Product',
        productThumbnail: 'thumb.jpg',
        productImage1: 'img1.jpg',
        productImage2: 'img2.jpg',
        productImage3: 'img3.jpg',
        productImage4: 'img4.jpg',
        productDescription: 'Test Description',
        productPrice: 100,
        categoryID: 1,
        stock: 50,
        brandID: 1,
      },
    ]);
  }
  add(data: any) {
    return of({ success: true, ...data });
  }
  update(data: any) {
    return of({ success: true, ...data });
  }
}

class MockCategoryService {
  getCategories() {
    return of([{ categoryID: 1, categoryName: 'Test Category' }]);
  }
}

class MockBrandService {
  getBrands() {
    return of([{ brandID: 1, brandName: 'Test Brand' }]);
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

describe('ProductForm', () => {
  let component: ProductForm;
  let fixture: ComponentFixture<ProductForm>;
  let productService: Product;
  let categoryService: Category;
  let brandService: Brand;
  let router: Router;
  let toast: Toast;
  let activatedRoute: MockActivatedRoute;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProductForm,
        FormsModule,
        MatButtonModule,
        MatSelectModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatIconModule,
        MatDividerModule,
        CommonModule,
        MockCloudinaryUploadComponent,
        BrowserAnimationsModule, // Required for MatSelect
      ],
      providers: [
        { provide: Product, useClass: MockProductService },
        { provide: Category, useClass: MockCategoryService },
        { provide: Brand, useClass: MockBrandService },
        { provide: Router, useClass: MockRouter },
        { provide: ActivatedRoute, useClass: MockActivatedRoute },
        { provide: Toast, useClass: MockToast },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductForm);
    component = fixture.componentInstance;
    productService = TestBed.inject(Product);
    categoryService = TestBed.inject(Category);
    brandService = TestBed.inject(Brand);
    router = TestBed.inject(Router);
    toast = TestBed.inject(Toast);
    activatedRoute = TestBed.inject(
      ActivatedRoute
    ) as unknown as MockActivatedRoute;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be in "add" mode and load dropdown data on init without an ID', fakeAsync(() => {
    const categorySpy = spyOn(
      categoryService,
      'getCategories'
    ).and.callThrough();
    const brandSpy = spyOn(brandService, 'getBrands').and.callThrough();

    fixture.detectChanges();
    tick();

    expect(component.isEdit).toBeFalse();
    expect(component.isLoading).toBeFalse();
    expect(component.isLoadingDropdowns).toBeFalse();
    expect(categorySpy).toHaveBeenCalled();
    expect(brandSpy).toHaveBeenCalled();
    expect(component.categories.length).toBe(1);
    expect(component.brands.length).toBe(1);
  }));

  it('should be in "edit" mode and load product and dropdown data on init with an ID', fakeAsync(() => {
    activatedRoute.snapshot.params = { id: 1 };
    const categorySpy = spyOn(
      categoryService,
      'getCategories'
    ).and.callThrough();
    const brandSpy = spyOn(brandService, 'getBrands').and.callThrough();
    const productSpy = spyOn(productService, 'get').and.callThrough();

    fixture.detectChanges();
    tick();

    expect(component.isEdit).toBeTrue();
    expect(component.productID).toBe(1);
    expect(productSpy).toHaveBeenCalledWith({ id: 1 });
    expect(categorySpy).toHaveBeenCalled();
    expect(brandSpy).toHaveBeenCalled();
    expect(component.productName).toBe('Test Product');
    expect(component.productPrice).toBe(100);
    expect(component.categoryID).toBe(1);
    expect(component.brands.length).toBe(1);
    expect(component.isLoading).toBeFalse();
  }));

  it('should add a new product', fakeAsync(() => {
    const addSpy = spyOn(productService, 'add').and.callThrough();
    component.productName = 'New Product';
    component.productThumbnail = 'new-thumb.jpg';
    component.productImage1 = 'new-img1.jpg';
    component.productImage2 = 'new-img2.jpg';
    component.productDescription = 'New Description';
    component.productPrice = 150;
    component.categoryID = 1;
    component.stock = 10;
    component.brandID = 1;
    fixture.detectChanges();

    component.add();
    tick();

    expect(addSpy).toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledWith(
      'Product created successfully!',
      'success'
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/products');
  }));

  it('should update an existing product', fakeAsync(() => {
    const updateSpy = spyOn(productService, 'update').and.callThrough();
    component.isEdit = true;
    component.productID = 1;
    component.productName = 'Updated Product';
    component.productThumbnail = 'updated-thumb.jpg';
    component.productImage1 = 'updated-img1.jpg';
    component.productImage2 = 'updated-img2.jpg';
    component.productDescription = 'Updated Description';
    component.productPrice = 200;
    component.categoryID = 1;
    component.stock = 20;
    component.brandID = 1;
    fixture.detectChanges();

    component.update();
    tick();

    expect(updateSpy).toHaveBeenCalled();
    expect(toast.show).toHaveBeenCalledWith(
      'Product updated successfully!',
      'success'
    );
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/products');
  }));

  it('should navigate back on cancel', () => {
    component.cancel();
    expect(router.navigateByUrl).toHaveBeenCalledWith('/admin/products');
  });

  it('should check form validity', () => {
    // Initially invalid
    expect(component.isFormValid()).toBeFalse();

    // Fill in all required fields
    component.productName = 'Test';
    component.productThumbnail = 't.jpg';
    component.productImage1 = 'i1.jpg';
    component.productImage2 = 'i2.jpg';
    component.productDescription = 'desc';
    component.productPrice = 1;
    component.categoryID = 1;
    component.stock = 1;
    component.brandID = 1;

    expect(component.isFormValid()).toBeTrue();
  });

  it('should disable the submit button when form is invalid', fakeAsync(() => {
    fixture.detectChanges();

    component.productName = ''; // Make it invalid
    fixture.detectChanges();
    tick();

    const submitButton = fixture.debugElement.query(
      By.css('button.bg-slate-600')
    );
    expect(submitButton.properties['disabled']).toBeTrue();
  }));

  it('should enable the submit button when form is valid', fakeAsync(() => {
    fixture.detectChanges();

    component.productName = 'Test';
    component.productThumbnail = 't.jpg';
    component.productImage1 = 'i1.jpg';
    component.productImage2 = 'i2.jpg';
    component.productDescription = 'desc';
    component.productPrice = 1;
    component.categoryID = 1;
    component.stock = 1;
    component.brandID = 1;
    fixture.detectChanges();
    tick();

    const submitButton = fixture.debugElement.query(
      By.css('button.bg-slate-600')
    );
    expect(submitButton.properties['disabled']).toBeFalse();
  }));

  it('should show an error toast when product creation fails', fakeAsync(() => {
    spyOn(productService, 'add').and.returnValue(
      throwError(() => new Error('Creation failed'))
    );
    component.productName = 'Test';
    component.productThumbnail = 't.jpg';
    component.productImage1 = 'i1.jpg';
    component.productImage2 = 'i2.jpg';
    component.productDescription = 'desc';
    component.productPrice = 1;
    component.categoryID = 1;
    component.stock = 1;
    component.brandID = 1;
    fixture.detectChanges();

    component.add();
    tick();

    expect(toast.show).toHaveBeenCalledWith('Error creating product', 'error');
    expect(component.isLoading).toBeFalse();
  }));
});
