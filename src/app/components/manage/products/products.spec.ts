import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Products } from './products';
import { Product } from '../../../services/product/product';
import { DialogService } from '../../../services/dialog/dialog';
import { Toast } from '../../../services/toast/toast';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;
  let productServiceMock: jasmine.SpyObj<Product>;
  let dialogServiceMock: jasmine.SpyObj<DialogService>;
  let routerMock: jasmine.SpyObj<Router>;
  let toastServiceMock: jasmine.SpyObj<Toast>;

  const mockProducts = [
    {
      productID: 1,
      productName: 'Laptop',
      productPrice: 1200,
      stock: 50,
      categoryName: 'Electronics',
      productThumbnail: 'placeholder-url',
      productDescription: 'A high-performance laptop.',
      categoryID: 1,
      brandID: 1,
      rating: 4.5,
      brandName: 'BrandA',
      creationDate: new Date(),
      updateDate: new Date(),
      isFeatured: false,
      productImages: [],
      productTags: [],
    },
    {
      productID: 2,
      productName: 'Mouse',
      productPrice: 25,
      stock: 5,
      categoryName: 'Accessories',
      productThumbnail: 'placeholder-url',
      productDescription: 'A wireless mouse.',
      categoryID: 2,
      brandID: 2,
      rating: 4.0,
      brandName: 'BrandB',
      creationDate: new Date(),
      updateDate: new Date(),
      isFeatured: false,
      productImages: [],
      productTags: [],
    },
    {
      productID: 3,
      productName: 'Keyboard',
      productPrice: 75,
      stock: 0,
      categoryName: 'Accessories',
      productThumbnail: 'placeholder-url',
      productDescription: 'A mechanical keyboard.',
      categoryID: 2,
      brandID: 2,
      rating: 4.8,
      brandName: 'BrandB',
      creationDate: new Date(),
      updateDate: new Date(),
      isFeatured: false,
      productImages: [],
      productTags: [],
    },
    {
      productID: 4,
      productName: 'Monitor',
      productPrice: 300,
      stock: 15,
      categoryName: 'Electronics',
      productThumbnail: 'placeholder-url',
      productDescription: 'A 27-inch monitor.',
      categoryID: 1,
      brandID: 1,
      rating: 4.2,
      brandName: 'BrandA',
      creationDate: new Date(),
      updateDate: new Date(),
      isFeatured: false,
      productImages: [],
      productTags: [],
    },
  ];

  beforeEach(async () => {
    productServiceMock = jasmine.createSpyObj('Product', ['get', 'delete']);
    dialogServiceMock = jasmine.createSpyObj('DialogService', ['open']);
    dialogServiceMock.confirmed$ = of(true); // Mock a confirmation result
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    toastServiceMock = jasmine.createSpyObj('Toast', ['show']);

    await TestBed.configureTestingModule({
      imports: [
        Products,
        FormsModule,
        CommonModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatCheckboxModule,
      ],
      providers: [
        { provide: Product, useValue: productServiceMock },
        { provide: DialogService, useValue: dialogServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: Toast, useValue: toastServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;

    // Set up mock responses before initial change detection
    productServiceMock.get.and.returnValue(
      of([{ totalCount: mockProducts.length }, ...mockProducts] as any)
    );
    productServiceMock.delete.and.returnValue(of(null));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load products on init', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(productServiceMock.get).toHaveBeenCalled();
    expect(component.products.length).toBe(mockProducts.length);
    expect(component.filteredProducts.length).toBe(mockProducts.length);
    expect(component.isLoading).toBeFalse();
    expect(component.totalProducts).toBe(mockProducts.length);
  }));

  it('should handle product loading error', fakeAsync(() => {
    productServiceMock.get.and.returnValue(
      throwError(() => new Error('API Error'))
    );

    component.ngOnInit();
    tick();

    expect(productServiceMock.get).toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
    expect(component.products.length).toBe(0);
    expect(component.filteredProducts.length).toBe(0);
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      'Error loading products',
      'error'
    );
  }));

  it('should filter products on search', fakeAsync(() => {
    component.ngOnInit();
    tick(); // Load initial data

    component.onSearch({ target: { value: 'laptop' } } as any);
    tick(); // Trigger search and reload

    expect(productServiceMock.get).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'laptop', page: 1 })
    );
  }));

  it('should sort products and change order', fakeAsync(() => {
    component.ngOnInit();
    tick();

    // Sort by price, ascending
    component.sortProducts('productPrice');
    tick();
    expect(component.sortBy).toBe('productPrice');
    expect(component.sortOrder).toBe('asc');
    expect(productServiceMock.get).toHaveBeenCalledWith(
      jasmine.objectContaining({ sortBy: 'productPrice', sortOrder: 'asc' })
    );

    // Sort by price again, should be descending
    component.sortProducts('productPrice');
    tick();
    expect(component.sortOrder).toBe('desc');
    expect(productServiceMock.get).toHaveBeenCalledWith(
      jasmine.objectContaining({ sortBy: 'productPrice', sortOrder: 'desc' })
    );
  }));

  it('should toggle a single product selection', () => {
    component.filteredProducts = mockProducts as any;
    component.selectedProducts.clear();

    // Select a product
    component.toggleProductSelection(mockProducts[0].productID);
    expect(
      component.selectedProducts.has(mockProducts[0].productID)
    ).toBeTrue();

    // Deselect the same product
    component.toggleProductSelection(mockProducts[0].productID);
    expect(
      component.selectedProducts.has(mockProducts[0].productID)
    ).toBeFalse();
  });

  it('should select all and deselect all', () => {
    component.filteredProducts = mockProducts as any;
    component.selectedProducts.clear();

    // Select all
    component.toggleSelectAll();
    expect(component.selectedProducts.size).toBe(mockProducts.length);
    expect(component.isAllSelected()).toBeTrue();

    // Deselect all
    component.toggleSelectAll();
    expect(component.selectedProducts.size).toBe(0);
    expect(component.isAllSelected()).toBeFalse();
  });

  it('should show indeterminate state correctly', () => {
    component.filteredProducts = mockProducts as any;
    component.selectedProducts.clear();

    component.toggleProductSelection(mockProducts[0].productID);
    expect(component.isIndeterminate()).toBeTrue();

    component.toggleProductSelection(mockProducts[1].productID);
    expect(component.isIndeterminate()).toBeTrue();

    component.toggleProductSelection(mockProducts[2].productID);
    component.toggleProductSelection(mockProducts[3].productID);
    expect(component.isIndeterminate()).toBeFalse(); // All selected, no longer indeterminate
  });

  it('should confirm and delete a single product', fakeAsync(() => {
    component.filteredProducts = mockProducts as any;
    const productToDelete = mockProducts[0];

    // Mock the dialog service to confirm the deletion
    dialogServiceMock.open.and.returnValue(null);
    dialogServiceMock.confirmed$ = of(true);

    component.confirmDelete(productToDelete as any, new Event('click'));
    tick();

    expect(dialogServiceMock.open).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Delete Product',
        message: jasmine.any(String),
      })
    );
    expect(productServiceMock.delete).toHaveBeenCalledWith(
      productToDelete.productID
    );
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      'Product deleted successfully',
      'success'
    );
  }));

  it('should confirm and perform bulk delete', fakeAsync(() => {
    component.filteredProducts = mockProducts as any;
    component.selectedProducts.add(1);
    component.selectedProducts.add(2);

    // Mock the dialog service to confirm the deletion
    dialogServiceMock.open.and.returnValue(null);
    dialogServiceMock.confirmed$ = of(true);

    component.bulkDelete();
    tick();

    expect(dialogServiceMock.open).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Delete Products',
        message: jasmine.stringContaining('2 product'),
      })
    );

    expect(productServiceMock.delete).toHaveBeenCalledTimes(2);
    expect(productServiceMock.delete).toHaveBeenCalledWith(1);
    expect(productServiceMock.delete).toHaveBeenCalledWith(2);
    expect(toastServiceMock.show).toHaveBeenCalledWith(
      '2 products deleted successfully',
      'success'
    );
  }));

  it('should get correct stock status', () => {
    expect(component.getStockStatus(50)).toEqual({
      text: 'In Stock',
      class: 'text-green-600 bg-green-100',
    });
    expect(component.getStockStatus(5)).toEqual({
      text: 'Low Stock',
      class: 'text-yellow-600 bg-yellow-100',
    });
    expect(component.getStockStatus(0)).toEqual({
      text: 'Out of Stock',
      class: 'text-red-600 bg-red-100',
    });
  });

  it('should navigate to the correct page on goToPage', fakeAsync(() => {
    component.totalProducts = 50;
    component.pageSize = 10;
    component.totalPages = 5;
    component.currentPage = 1;

    component.goToPage(3);
    tick();

    expect(component.currentPage).toBe(3);
    expect(productServiceMock.get).toHaveBeenCalledWith(
      jasmine.objectContaining({ page: 3 })
    );
  }));
});
