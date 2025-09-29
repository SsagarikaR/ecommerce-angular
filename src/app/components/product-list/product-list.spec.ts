import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ProductList } from './product-list';
import { ActivatedRoute, RouterLink, convertToParamMap } from '@angular/router';
import { Product } from '../../services/product/product';
import { of, BehaviorSubject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { product } from '../../types/type';
import { ProductCard } from '../product-card/product-card';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Define a type for the mock ActivatedRoute to avoid implicit 'any'
type MockActivatedRoute = {
  queryParams: BehaviorSubject<any>;
};

describe('ProductList', () => {
  let component: ProductList;
  let fixture: ComponentFixture<ProductList>;
  let mockProductService: jasmine.SpyObj<Product>;
  let mockActivatedRoute: MockActivatedRoute;

  const mockProducts: product[] = [
    {
      productID: 1,
      productName: 'Product 1',
      productThumbnail: 'thumb1.jpg',
      productDescription: 'Desc 1',
      productPrice: 10,
      categoryID: 1,
      stock: 5,
      brandID: 1,
      brandName: 'Brand A',
      totalCount: 10,
      rating: 4,
      categoryName: 'Category A',
      wishlist: 'no',
      productImage1: 'img1.jpg',
      productImage2: 'img2.jpg',
    },
    {
      productID: 2,
      productName: 'Product 2',
      productThumbnail: 'thumb2.jpg',
      productDescription: 'Desc 2',
      productPrice: 20,
      categoryID: 1,
      stock: 10,
      brandID: 1,
      brandName: 'Brand A',
      totalCount: 10,
      rating: 5,
      categoryName: 'Category A',
      wishlist: 'no',
      productImage1: 'img3.jpg',
      productImage2: 'img4.jpg',
    },
    // Add more mock products as needed for pagination tests
  ];

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj('Product', ['get']);
    // Use a BehaviorSubject to more realistically simulate query param changes
    mockActivatedRoute = {
      queryParams: new BehaviorSubject({}),
    };

    await TestBed.configureTestingModule({
      imports: [ProductList, ProductCard, RouterLink, HttpClientTestingModule],
      providers: [
        { provide: Product, useValue: mockProductService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductList);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test Case 1: Initial state and successful product fetch
  it('should fetch and display products on initialization', fakeAsync(() => {
    // Arrange
    const mockResponse = [
      { ...mockProducts[0], totalCount: 2 },
      { ...mockProducts[1], totalCount: 2 },
    ];
    mockProductService.get.and.returnValue(of(mockResponse));

    // Act
    fixture.detectChanges(); // Triggers ngOnInit
    tick(); // Wait for the observable to resolve

    // Assert
    expect(component.products.length).toBe(2);
    expect(component.products).toEqual(mockResponse);
    expect(component.loading).toBeFalse();
    expect(component.totalItems).toBe(2);
    expect(component.totalPages).toBe(1);

    const productCards = fixture.debugElement.queryAll(
      By.css('app-product-card')
    );
    expect(productCards.length).toBe(2);
  }));

  it('should display "No products found" when the API returns an empty array', fakeAsync(() => {
    // Arrange
    mockProductService.get.and.returnValue(of([]));

    // Act
    fixture.detectChanges();
    tick();

    // Assert
    expect(component.products.length).toBe(0);
    expect(component.loading).toBeFalse();

    const noProductsMessage = fixture.debugElement.query(
      By.css('.text-slate-500')
    );
    expect(noProductsMessage.nativeElement.textContent.trim()).toBe(
      'No products found.'
    );
  }));

  // Test Case 4: Pagination logic
  it('should update page and fetch products when goToPage is called', fakeAsync(() => {
    // Arrange
    const mockResponse = mockProducts.map((p) => ({ ...p, totalCount: 15 }));
    mockProductService.get.and.returnValue(of(mockResponse));
    component.limit = 5;
    component.totalItems = 15;
    component.totalPages = 3;
    fixture.detectChanges();
    tick();

    // Act
    component.goToPage(2);
    fixture.detectChanges();
    tick();

    // Assert
    expect(component.page).toBe(2);
    expect(mockProductService.get).toHaveBeenCalledWith({ page: 2, limit: 5 });
  }));

  // Test Case 5: Pagination button display
  it('should render pagination buttons correctly', fakeAsync(() => {
    // Arrange
    const mockResponse = mockProducts.map((p) => ({ ...p, totalCount: 15 }));
    mockProductService.get.and.returnValue(of(mockResponse));
    component.limit = 5;
    component.totalItems = 15;
    component.totalPages = 3;
    fixture.detectChanges();
    tick();

    // Assert
    const pageButtons = fixture.debugElement.queryAll(
      By.css('.flex.justify-center button')
    );
    expect(pageButtons.length).toBe(5); // Prev, 1, 2, 3, Next

    expect(pageButtons[0].nativeElement.textContent.trim()).toBe('Prev');
    expect(pageButtons[1].nativeElement.textContent.trim()).toBe('1');
    expect(pageButtons[2].nativeElement.textContent.trim()).toBe('2');
    expect(pageButtons[3].nativeElement.textContent.trim()).toBe('3');
    expect(pageButtons[4].nativeElement.textContent.trim()).toBe('Next');
  }));
});
