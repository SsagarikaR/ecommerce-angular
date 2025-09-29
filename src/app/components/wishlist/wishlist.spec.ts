import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { WishlistPage } from './wishlist';
import { Wishlist } from '../../services/wishlist/wishlist';
import { Toast } from '../../services/toast/toast';
import { Cart } from '../../services/cart/cart';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { provideRouter, RouterLink } from '@angular/router';
import { product } from '../../types/type';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('WishlistPage', () => {
  let component: WishlistPage;
  let fixture: ComponentFixture<WishlistPage>;
  let mockWishlistService: jasmine.SpyObj<Wishlist>;
  let mockCartService: jasmine.SpyObj<Cart>;
  let mockToastService: jasmine.SpyObj<Toast>;

  const mockWishlistItems: product[] = [
    {
      wishListID: 1,
      productID: 1,
      productName: 'Sample Product 1',
      productThumbnail: 'thumb1.jpg',
      productPrice: 10,
      stock: 5,
      wishlist: 'yes',
      categoryID: 1,
      brandID: 1,
      brandName: 'Brand A',
      totalCount: 1,
      rating: 4,
      categoryName: 'Category A',
      productDescription: 'Desc 1',
      productImage1: 'img1.jpg',
      productImage2: 'img2.jpg',
    },
    {
      wishListID: 2,
      productID: 2,
      productName: 'Sample Product 2',
      productThumbnail: 'thumb2.jpg',
      productPrice: 20,
      stock: 0,
      wishlist: 'yes',
      categoryID: 1,
      brandID: 1,
      brandName: 'Brand A',
      totalCount: 1,
      rating: 5,
      categoryName: 'Category A',
      productDescription: 'Desc 2',
      productImage1: 'img3.jpg',
      productImage2: 'img4.jpg',
    },
  ];

  beforeEach(async () => {
    // Create spy objects for services
    mockWishlistService = jasmine.createSpyObj('Wishlist', [
      'fetchFromWishlist',
      'deleteFromWishlist',
    ]);
    mockCartService = jasmine.createSpyObj('Cart', ['addItem']);
    mockToastService = jasmine.createSpyObj('Toast', ['show']);

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterLink,
        WishlistPage,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Wishlist, useValue: mockWishlistService },
        { provide: Cart, useValue: mockCartService },
        { provide: Toast, useValue: mockToastService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WishlistPage);
    component = fixture.componentInstance;
  });

  // Test Case 1: Component creation
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Test Case 3: Display a list of items on successful fetch
  it('should display wishlist items after a successful fetch', fakeAsync(() => {
    mockWishlistService.fetchFromWishlist.and.returnValue(
      of(mockWishlistItems)
    );

    fixture.detectChanges(); // Trigger ngOnInit
    tick(); // Resolve the observable

    expect(component.loading).toBeFalse();
    expect(component.wishlist).toEqual(mockWishlistItems);

    fixture.detectChanges(); // Update the view
    const wishlistItems = fixture.debugElement.queryAll(
      By.css('.space-y-4 > div')
    );
    expect(wishlistItems.length).toBe(mockWishlistItems.length);
    expect(
      wishlistItems[0].query(By.css('h3')).nativeElement.textContent.trim()
    ).toBe('Sample Product 1');
  }));

  // Test Case 4: Display empty state when no items are returned
  it('should show an empty wishlist message when the API returns no items', fakeAsync(() => {
    mockWishlistService.fetchFromWishlist.and.returnValue(of([]));

    fixture.detectChanges();
    tick();

    expect(component.loading).toBeFalse();
    expect(component.wishlist.length).toBe(0);

    fixture.detectChanges();
    const emptyMessage = fixture.debugElement.query(
      By.css('.text-slate-500.mb-4')
    );
    expect(emptyMessage.nativeElement.textContent.trim()).toBe(
      'Your wishlist is empty'
    );
  }));

  // Test Case 5: Handle API error during fetch
  it('should show a toast message on fetch error', fakeAsync(() => {
    const mockError = {
      error: { message: 'Failed to connect to server' },
      status: 500,
    };
    mockWishlistService.fetchFromWishlist.and.returnValue(
      throwError(() => mockError)
    );

    fixture.detectChanges();
    tick();

    expect(component.loading).toBeFalse();
    expect(mockToastService.show).toHaveBeenCalledWith(
      mockError.error.message,
      'error'
    );
  }));

  // Test Case 6: Handle a 404 error and show an empty state
  it('should handle 404 error by showing an empty wishlist state', fakeAsync(() => {
    const mockError = {
      status: 404,
      error: { message: 'No items in wishlist' },
    };
    mockWishlistService.fetchFromWishlist.and.returnValue(
      throwError(() => mockError)
    );

    fixture.detectChanges();
    tick();

    expect(component.loading).toBeFalse();
    expect(component.wishlist.length).toBe(0);
    expect(mockToastService.show).toHaveBeenCalledWith(
      mockError.error.message,
      'error'
    );

    fixture.detectChanges();
    const emptyMessage = fixture.debugElement.query(
      By.css('.text-slate-500.mb-4')
    );
    expect(emptyMessage.nativeElement.textContent.trim()).toBe(
      'Your wishlist is empty'
    );
  }));

  // Test Case 7: Add item to cart and verify cart service call
  it('should add an item to the cart', () => {
    const itemToAdd = mockWishlistItems[0];
    component.addToCart(itemToAdd);
    expect(mockCartService.addItem).toHaveBeenCalledWith({
      productID: itemToAdd.productID,
      quantity: 1,
    });
  });

  // Test Case 8: Remove an item from the wishlist
  // it('should remove an item from the wishlist and refresh the list', fakeAsync(() => {
  //   const itemToRemove = mockWishlistItems[0];
  //   const mockDeleteResponse = { message: 'Item removed successfully' };

  //   // Set up mock responses for both delete and subsequent fetch
  //   mockWishlistService.deleteFromWishlist.and.returnValue(
  //     of(mockDeleteResponse)
  //   );
  //   mockWishlistService.fetchFromWishlist.and.returnValue(of([])); // Simulate the list being empty after deletion

  //   // Set the component's state as if a list was already fetched
  //   component.wishlist = mockWishlistItems;
  //   component.loading = false;
  //   fixture.detectChanges();

  //   // Call the removal method
  //   component.removeItem(itemToRemove.wishListID as number);
  //   tick();

  //   expect(mockWishlistService.deleteFromWishlist).toHaveBeenCalledWith(
  //     itemToRemove.wishListID
  //   );
  //   expect(mockToastService.show).toHaveBeenCalledWith(
  //     mockDeleteResponse.message,
  //     'success'
  //   );
  //   expect(mockWishlistService.fetchFromWishlist).toHaveBeenCalled(); // Should refresh the list
  //   expect(component.wishlist.length).toBe(0);
  // }));
});
