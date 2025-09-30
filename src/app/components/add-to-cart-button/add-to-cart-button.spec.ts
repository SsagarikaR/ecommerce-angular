import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddToCartButton } from './add-to-cart-button';
import { Cart } from '../../services/cart/cart';
import { of } from 'rxjs';
import { product } from '../../types/type';

class MockCartService {
  addItem() {
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
      providers: [{ provide: Cart, useClass: MockCartService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AddToCartButton);
    component = fixture.componentInstance;
    cartService = TestBed.inject(Cart);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display "Add to Cart" and be enabled when the product is in stock', () => {
    component.item = { productID: 1, stock: 5 } as product;
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    expect(button.textContent).toContain('Add to Cart');
    expect(button.disabled).toBeFalse();
  });

  it('should display "Out of Stock" and be disabled when the product is out of stock', () => {
    component.item = { productID: 1, stock: 0 } as product;
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    expect(button.textContent).toContain('Out of Stock');
    expect(button.disabled).toBeTrue();
  });

  it('should call addItem on the Cart service when the button is clicked', () => {
    component.item = { productID: 1, stock: 5 } as product;
    fixture.detectChanges();

    const cartServiceSpy = spyOn(cartService, 'addItem').and.callThrough();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    button.click();

    expect(cartServiceSpy).toHaveBeenCalledWith({ productID: 1, quantity: 1 });
  });

  it('should not call addItem on the Cart service when the product is out of stock', () => {
    component.item = { productID: 1, stock: 0 } as product;
    fixture.detectChanges();

    const cartServiceSpy = spyOn(cartService, 'addItem').and.callThrough();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    button.click();

    expect(cartServiceSpy).not.toHaveBeenCalled();
  });
});
