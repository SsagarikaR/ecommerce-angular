import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, of } from 'rxjs';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { CartModal } from './cart-modal';
import { Cart } from '../../services/cart/cart';
import { cartItem } from '../../types/type';

// Mock data for the cart items
const mockCartItems: cartItem[] = [
  {
    cartItemID: 1,
    quantity: 2,
    totalPrice: 200,

    productID: 101,
    productName: 'Sample Product 1',
    productThumbnail: 'thumb1.jpg',
    productPrice: 100,
    productDescription: 'desc',
    categoryID: 1,
    stock: 5,
    brandID: 1,
    brandName: 'Brand A',
    totalCount: 1,
    rating: 4,
    categoryName: 'Category A',
    wishlist: 'no',
    productImage1: 'img1.jpg',
    productImage2: 'img2.jpg',
    brandThumbnail: '',
    categoryThumbnail: '',
  },
  {
    cartItemID: 2,
    quantity: 1,
    totalPrice: 50,
    // Nested 'product' object
    productID: 102,
    productName: 'Sample Product 2',
    productThumbnail: 'thumb2.jpg',
    productPrice: 50,
    productDescription: 'desc',
    categoryID: 2,
    stock: 0,
    brandID: 2,
    brandName: 'Brand B',
    totalCount: 1,
    rating: 3,
    categoryName: 'Category B',
    wishlist: 'no',
    productImage1: 'img3.jpg',
    productImage2: 'img4.jpg',
    brandThumbnail: '',
    categoryThumbnail: '',
  },
];

// Mock the Cart service to control its behavior
class MockCartService {
  private cartItemsSubject = new BehaviorSubject<cartItem[]>([]);
  private cartModalSubject = new BehaviorSubject<boolean>(false);

  getCartItems() {
    return this.cartItemsSubject.asObservable();
  }

  cartModalOpen$ = this.cartModalSubject.asObservable();

  closeCartModal() {
    this.cartModalSubject.next(false);
  }

  openCartModal() {
    this.cartModalSubject.next(true);
  }

  updateItem(item: any) {
    return of('item updated');
  }

  deleteItem(cartItemID: number) {
    return of('item deleted');
  }

  // Helper method to simulate cart updates
  setCartItems(items: cartItem[]) {
    this.cartItemsSubject.next(items);
  }

  // Helper method to set modal state
  setModalState(state: boolean) {
    this.cartModalSubject.next(state);
  }
}

describe('CartModal', () => {
  let component: CartModal;
  let fixture: ComponentFixture<CartModal>;
  let cartService: MockCartService;
  let router: Router;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        CartModal,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        { provide: Cart, useClass: MockCartService }, // Use the mock Cart service
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CartModal);
    component = fixture.componentInstance;
    cartService = TestBed.inject(Cart) as unknown as MockCartService;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  // Test case 1: Component creation
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test case 2: Initial state with no items
  it('should not show the cart modal initially', () => {
    fixture.detectChanges();
    const modalElement = fixture.debugElement.query(By.css('.fixed'));
    expect(modalElement).toBeNull();
  });

  // Test case 3: Open and close the modal
  it('should open and close the modal based on cart service state', () => {
    cartService.setModalState(true);
    fixture.detectChanges();
    let modalElement = fixture.debugElement.query(By.css('.fixed'));
    expect(modalElement).not.toBeNull();
    expect(component.isOpen).toBeTrue();

    cartService.setModalState(false);
    fixture.detectChanges();
    modalElement = fixture.debugElement.query(By.css('.fixed'));
    expect(modalElement).toBeNull();
    expect(component.isOpen).toBeFalse();
  });

  // Test case 4: Displaying cart items
  it('should display cart items when they are present', () => {
    cartService.setCartItems(mockCartItems);
    cartService.setModalState(true);
    fixture.detectChanges();

    const itemElements = fixture.debugElement.queryAll(
      By.css('.flex.items-center')
    );

    // Assert the correct number of items.
    expect(itemElements.length).toBe(2);

    // Assert properties of the first item
    const firstItem = itemElements[0];
    const firstItemName = firstItem.query(By.css('h4')).nativeElement
      .textContent;
    expect(firstItemName).toContain('Sample Product 1');

    // Assert properties of the second item
    const secondItem = itemElements[1];
    const secondItemQuantity = secondItem.query(By.css('.px-2.text-slate-700'))
      .nativeElement.textContent;
    expect(secondItemQuantity).toContain('1');
  });
  // Test case 5: Updating item quantity
  it('should call updateItem on the cart service when a quantity button is clicked', () => {
    cartService.setCartItems(mockCartItems);
    cartService.setModalState(true);
    fixture.detectChanges();

    const cartServiceSpy = spyOn(cartService, 'updateItem').and.callThrough();
    const plusButton = fixture.debugElement.query(
      By.css('.p-4.space-y-4 button:last-of-type')
    );

    plusButton.nativeElement.click();

    expect(cartServiceSpy).toHaveBeenCalledWith({ cartItemID: 1, quantity: 3 });
  });

  // Test case 6: Disabling decrement button for quantity 1
  it('should disable the decrement button when quantity is 1', () => {
    const singleItem = [{ ...mockCartItems[0], quantity: 1 }];
    cartService.setCartItems(singleItem);
    cartService.setModalState(true);
    fixture.detectChanges();

    const minusButton = fixture.debugElement.query(
      By.css('.p-4.space-y-4 button:first-of-type')
    );
    expect(minusButton.nativeElement.disabled).toBeTrue();
  });

  // Test case 7: Removing an item
  it('should call deleteItem on the cart service when the "Remove" button is clicked', () => {
    cartService.setCartItems(mockCartItems);
    cartService.setModalState(true);
    fixture.detectChanges();

    const cartServiceSpy = spyOn(cartService, 'deleteItem').and.callThrough();
    const removeButton = fixture.debugElement.query(
      By.css('.text-rose-500.text-xs')
    );

    removeButton.nativeElement.click();

    expect(cartServiceSpy).toHaveBeenCalledWith(1);
  });

  // Test case 8: Total price calculation
  it('should display the correct total price', () => {
    const customItems = [
      { ...mockCartItems[0], quantity: 1, totalPrice: 100 },
      { ...mockCartItems[1], quantity: 2, totalPrice: 100 },
    ];
    cartService.setCartItems(customItems);
    cartService.setModalState(true);
    fixture.detectChanges();

    const totalPriceElement = fixture.debugElement.query(
      By.css('.font-medium.mb-3')
    ).nativeElement;
    expect(totalPriceElement.textContent).toContain('Total: ₹100');
  });

  // Test case 9: Checkout navigation
  it('should navigate to checkout and close the modal on "Checkout" button click', () => {
    cartService.setCartItems(mockCartItems);
    cartService.setModalState(true);
    fixture.detectChanges();

    const routerSpy = spyOn(router, 'navigate');
    const closeSpy = spyOn(component, 'close').and.callThrough();

    const checkoutButton = fixture.debugElement.query(
      By.css('.w-full.bg-slate-600')
    );
    checkoutButton.nativeElement.click();

    expect(closeSpy).toHaveBeenCalled();
    expect(routerSpy).toHaveBeenCalledWith(['/checkout']);
  });

  // Test case 10: Checkout button disabled when cart is empty
  it('should disable the checkout button when the cart is empty', () => {
    cartService.setCartItems([]);
    cartService.setModalState(true);
    fixture.detectChanges();

    const checkoutButton = fixture.debugElement.query(
      By.css('.w-full.bg-slate-600')
    );
    expect(checkoutButton.nativeElement.disabled).toBeTrue();
  });
});
