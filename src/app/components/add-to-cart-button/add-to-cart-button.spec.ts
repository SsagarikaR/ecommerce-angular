import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddToCartButton } from './add-to-cart-button';
import { Cart } from '../../services/cart/cart';
import { of } from 'rxjs';
import { product } from '../../types/type';

// Mock the Cart service to control its behavior in tests
class MockCartService {
  addItem(item: any) {
    return of('Item added');
  }
}

describe('AddToCartButton', () => {
  let component: AddToCartButton;
  let fixture: ComponentFixture<AddToCartButton>;
  let cartService: Cart;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddToCartButton],
      providers: [
        { provide: Cart, useClass: MockCartService }, // Provide the mock service
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddToCartButton);
    component = fixture.componentInstance;
    cartService = TestBed.inject(Cart); // Inject the mock service
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Test case for when the product is in stock
  it('should display "Add to Cart" and be enabled when the product is in stock', () => {
    // Set up a mock product with stock > 0
    component.item = { productID: 1, stock: 5 } as product;
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    expect(button.textContent).toContain('Add to Cart');
    expect(button.disabled).toBeFalse();
  });

  // Test case for when the product is out of stock
  it('should display "Out of Stock" and be disabled when the product is out of stock', () => {
    // Set up a mock product with stock === 0
    component.item = { productID: 1, stock: 0 } as product;
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    expect(button.textContent).toContain('Out of Stock');
    expect(button.disabled).toBeTrue();
  });

  // Test case for the addToCart method
  it('should call addItem on the Cart service when the button is clicked', () => {
    // Set up a mock product
    component.item = { productID: 1, stock: 5 } as product;
    fixture.detectChanges();

    // Spy on the addItem method of the Cart service
    const cartServiceSpy = spyOn(cartService, 'addItem').and.callThrough();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    button.click();

    // Verify that addItem was called with the correct arguments
    expect(cartServiceSpy).toHaveBeenCalledWith({ productID: 1, quantity: 1 });
  });

  // Test case for not adding to cart when out of stock
  it('should not call addItem on the Cart service when the product is out of stock', () => {
    // Set up a mock product that is out of stock
    component.item = { productID: 1, stock: 0 } as product;
    fixture.detectChanges();

    // Spy on the addItem method
    const cartServiceSpy = spyOn(cartService, 'addItem').and.callThrough();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    button.click();

    // Verify that addItem was NOT called
    expect(cartServiceSpy).not.toHaveBeenCalled();
  });
});
