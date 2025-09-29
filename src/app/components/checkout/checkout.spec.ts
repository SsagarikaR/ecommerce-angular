import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Checkout } from './checkout';
import { Cart } from '../../services/cart/cart';
import { Orders } from '../../services/orders/orders';
import { Toast } from '../../services/toast/toast';

describe('Checkout', () => {
  let component: Checkout;
  let fixture: ComponentFixture<Checkout>;
  let cartService: Cart;
  let ordersService: Orders;
  let router: Router;
  let toast: Toast;
  let httpMock: HttpTestingController;

  const mockCartItems = [
    {
      productID: 1,
      productName: 'Product A',
      productThumbnail: 'thumb-a.jpg',
      productPrice: 100,
      quantity: 2,
      totalPrice: 200,
    },
    {
      productID: 2,
      productName: 'Product B',
      productThumbnail: 'thumb-b.jpg',
      productPrice: 50,
      quantity: 3,
      totalPrice: 150,
    },
  ];

  beforeEach(async () => {
    const cartServiceStub = {
      getCartItems: () => of(mockCartItems),
      clearCart: () => of(null),
    };

    const ordersServiceStub = {
      createOrder: () => of({ message: 'Order created successfully' }),
    };

    const routerStub = {
      navigate: jasmine.createSpy('navigate'),
    };

    const toastStub = {
      show: jasmine.createSpy('show'),
    };

    await TestBed.configureTestingModule({
      imports: [Checkout, HttpClientTestingModule, FormsModule, CommonModule],
      providers: [
        { provide: Cart, useValue: cartServiceStub },
        { provide: Orders, useValue: ordersServiceStub },
        { provide: Router, useValue: routerStub },
        { provide: Toast, useValue: toastStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Checkout);
    component = fixture.componentInstance;
    cartService = TestBed.inject(Cart);
    ordersService = TestBed.inject(Orders);
    router = TestBed.inject(Router);
    toast = TestBed.inject(Toast);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with cart items and calculate total amount', () => {
    expect(component.cartItems.length).toBe(2);
  });

  it('should redirect to home if cart is empty on init', fakeAsync(() => {
    // Override the stub to return an empty array
    spyOn(cartService, 'getCartItems').and.returnValue(of([]));

    // Re-initialize the component with the empty cart stub
    component.ngOnInit();
    tick(); // Wait for the async call to complete

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  }));

  it('should move to the next step when nextStep() is called', () => {
    component.currentStep = 1;
    component.nextStep();
    expect(component.currentStep).toBe(2);

    component.nextStep();
    expect(component.currentStep).toBe(3);

    component.nextStep();
    expect(component.currentStep).toBe(3); // Should not exceed step 3
  });

  it('should move to the previous step when previousStep() is called', () => {
    component.currentStep = 3;
    component.previousStep();
    expect(component.currentStep).toBe(2);

    component.previousStep();
    expect(component.currentStep).toBe(1);

    component.previousStep();
    expect(component.currentStep).toBe(1); // Should not go below step 1
  });

  it('should navigate to home on goBack()', () => {
    component.goBack();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should show and hide the confirmation modal', () => {
    expect(component.showModal).toBe(false);
    component.showConfirmModal();
    expect(component.showModal).toBe(true);
    component.hideConfirmModal();
    expect(component.showModal).toBe(false);
  });

  describe('confirmOrder()', () => {
    beforeEach(() => {
      // Set a valid address for testing the payload
      component.orderData = {
        state: 'Test State',
        city: 'Test City',
        pincode: '123456',
        locality: 'Test Locality',
        address: '123 Test Street',
      };
    });

    it('should set isLoading to true before the API call', () => {
      component.confirmOrder();
      expect(component.isLoading).toBe(true);
    });

    it('should show an error toast and set isLoading to false on API error', fakeAsync(() => {
      const errorMessage = 'Failed to create order.';
      spyOn(ordersService, 'createOrder').and.returnValue(
        throwError({ error: { message: errorMessage } })
      );

      component.confirmOrder();
      tick();

      expect(toast.show).toHaveBeenCalledWith(errorMessage, 'error');
      expect(component.isLoading).toBe(false);
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should show a generic error toast if API error message is unavailable', fakeAsync(() => {
      spyOn(ordersService, 'createOrder').and.returnValue(
        throwError({ error: {} })
      );

      component.confirmOrder();
      tick();

      expect(toast.show).toHaveBeenCalledWith(
        'Failed to create order. Please try again.',
        'error'
      );
    }));
  });
});
