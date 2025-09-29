import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Import the component and its dependencies for testing
import { ProductDetail } from './product-detail';
import { Product } from '../../services/product/product';
import { Wishlist } from '../../services/wishlist/wishlist';
import { Cart } from '../../services/cart/cart';
import { Review } from '../../services/review/review';
import { Toast } from '../../services/toast/toast';
import { product, review } from '../../types/type';
import { AddToCartButton } from '../add-to-cart-button/add-to-cart-button';
import { WishList } from '../shared/wish-list/wish-list';

describe('ProductDetail', () => {
  let component: ProductDetail;
  let fixture: ComponentFixture<ProductDetail>;
  let mockProductService: jasmine.SpyObj<Product>;
  let mockWishlistService: jasmine.SpyObj<Wishlist>;
  let mockReviewService: jasmine.SpyObj<Review>;
  let mockCartService: jasmine.SpyObj<Cart>;
  let mockToastService: jasmine.SpyObj<Toast>;

  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: (param: string) => {
          if (param === 'id') {
            return '1';
          }
          return null;
        },
      },
    },
  };

  const mockProduct: product = {
    productID: 1,
    productName: 'Test Product',
    productThumbnail: 'thumb.jpg',
    productDescription: 'A detailed description of the test product.',
    productPrice: 100,
    categoryID: 1,
    stock: 10,
    brandID: 1,
    brandName: 'Test Brand',
    totalCount: 1,
    rating: 4.5,
    categoryName: 'Electronics',
    wishlist: 'no',
    productImage1: 'img1.jpg',
    productImage2: 'img2.jpg',
    productImage3: 'img3.jpg',
  };

  const mockReviews: review[] = [
    {
      reviewID: 1,
      productID: 1,
      userID: 1,
      rating: 5,
      description: 'Excellent product!',
      name: 'John Doe',
      contactNo: '12345',
      email: 'john@example.com',
    },
    {
      reviewID: 2,
      productID: 1,
      userID: 2,
      rating: 4,
      description: 'Very good, would recommend.',
      name: 'Jane Smith',
      contactNo: '67890',
      email: 'jane@example.com',
    },
  ];

  beforeEach(async () => {
    mockProductService = jasmine.createSpyObj('Product', ['get']);
    mockWishlistService = jasmine.createSpyObj('Wishlist', [
      'addToWishlist',
      'deleteFromWishlist',
    ]);
    mockReviewService = jasmine.createSpyObj('Review', [
      'getReviewsOfProduct',
      'addReview',
    ]);
    mockCartService = jasmine.createSpyObj('Cart', ['addItem']);
    mockToastService = jasmine.createSpyObj('Toast', ['show']);

    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, ProductDetail],
      providers: [
        { provide: Product, useValue: mockProductService },
        { provide: Wishlist, useValue: mockWishlistService },
        { provide: Review, useValue: mockReviewService },
        { provide: Cart, useValue: mockCartService },
        { provide: Toast, useValue: mockToastService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetail);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch product and reviews on init and hide loading', fakeAsync(() => {
    mockProductService.get.and.returnValue(of([mockProduct]));
    mockReviewService.getReviewsOfProduct.and.returnValue(of(mockReviews));

    component.ngOnInit();
    tick(); // Wait for observables to complete
    fixture.detectChanges();

    expect(component.product).toEqual(mockProduct);
    expect(component.reviews).toEqual(mockReviews);
    expect(component.loading).toBeFalse();
    expect(component.reviewLoading).toBeFalse();
    expect(component.selectedImage).toBe(mockProduct.productThumbnail);
  }));

  it('should show error message if product fetch fails', fakeAsync(() => {
    spyOn(console, 'error');
    mockProductService.get.and.returnValue(
      throwError(() => new Error('API Error'))
    );
    mockReviewService.getReviewsOfProduct.and.returnValue(of([]));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    expect(component.product).toBeNull();
    expect(component.loading).toBeFalse();
    expect(console.error).toHaveBeenCalled();
  }));

  it('should display product details correctly after data is loaded', fakeAsync(() => {
    mockProductService.get.and.returnValue(of([mockProduct]));
    mockReviewService.getReviewsOfProduct.and.returnValue(of(mockReviews));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const productName = fixture.debugElement.query(By.css('h1')).nativeElement;
    const productPrice = fixture.debugElement.query(
      By.css('.text-2xl')
    ).nativeElement;
    const productStock = fixture.debugElement.query(
      By.css('.text-green-500')
    ).nativeElement;

    expect(productName.textContent.trim()).toBe(mockProduct.productName);
    expect(productPrice.textContent.trim()).toBe(
      `₹${mockProduct.productPrice}`
    );
    expect(productStock.textContent.trim()).toContain(
      `In Stock (${mockProduct.stock})`
    );
  }));

  it('should display reviews and average rating when reviews are available', fakeAsync(() => {
    mockProductService.get.and.returnValue(of([mockProduct]));
    mockReviewService.getReviewsOfProduct.and.returnValue(of(mockReviews));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const reviewCount = fixture.debugElement.query(
      By.css(
        'div.flex.items-center.space-x-4.text-sm.text-gray-600 > span:first-child'
      )
    ).nativeElement;
    const averageRating = fixture.debugElement.query(
      By.css('span.flex.items-center span:last-child')
    ).nativeElement;

    expect(reviewCount.textContent.trim()).toBe(
      `${mockReviews.length} reviews`
    );
    expect(averageRating.textContent.trim()).toBe('4.5/5');

    const reviewElements = fixture.debugElement.queryAll(
      By.css('.bg-white.border.border-gray-200')
    );
    expect(reviewElements.length).toBe(mockReviews.length);
  }));

  it('should show "No Reviews Yet" message when there are no reviews', fakeAsync(() => {
    mockProductService.get.and.returnValue(of([mockProduct]));
    mockReviewService.getReviewsOfProduct.and.returnValue(of([]));

    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const noReviewsMessage = fixture.debugElement.query(
      By.css('.text-xl.font-semibold')
    ).nativeElement;
    expect(noReviewsMessage.textContent.trim()).toBe('No Reviews Yet');
  }));

  it('should disable submit button if rating or description is invalid', fakeAsync(() => {
    mockProductService.get.and.returnValue(of([mockProduct]));
    mockReviewService.getReviewsOfProduct.and.returnValue(of([]));
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    const submitButton = fixture.debugElement.query(
      By.css('button[type="submit"]')
    ).nativeElement;

    // Test with no rating and short description
    component.newReviewRating = 0;
    component.newReviewDescription = 'too short';
    fixture.detectChanges();
    expect(submitButton.disabled).toBeTrue();

    // Test with rating but short description
    component.newReviewRating = 4;
    component.newReviewDescription = 'too short';
    fixture.detectChanges();
    expect(submitButton.disabled).toBeTrue();

    // Test with valid rating and description
    component.newReviewRating = 4;
    component.newReviewDescription = 'This is a valid review description.';
    fixture.detectChanges();
    expect(submitButton.disabled).toBeFalse();
  }));

  it('getAverageRating should return 0 for no reviews', () => {
    component.reviews = [];
    expect(component.getAverageRating()).toBe(0);
  });

  it('getAverageRating should calculate the correct average rating', () => {
    component.reviews = mockReviews;
    expect(component.getAverageRating()).toBe(4.5);
  });

  it('getInitials should return correct initials for a name', () => {
    expect(component.getInitials('John Doe')).toBe('JD');
    expect(component.getInitials('Alice')).toBe('A');
    expect(component.getInitials('')).toBe('U');
  });

  it('getRatingText should return the correct text for a given rating', () => {
    expect(component.getRatingText(1)).toBe('Poor');
    expect(component.getRatingText(3)).toBe('Good');
    expect(component.getRatingText(5)).toBe('Excellent');
  });
});
