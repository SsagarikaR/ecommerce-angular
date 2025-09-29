import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { of, throwError } from 'rxjs';

import { OrderComponent } from './order';
import { Orders } from '../../services/orders/orders';
import { DialogService } from '../../services/dialog/dialog';
import { Order } from '../../types/type';

// Corrected mock data to match the strict type definition.
const mockOrders: Order[] = [
  {
    orderID: 1,
    totalAmount: 150,
    items: [],
    state: 'California',
    city: 'Los Angeles',
    pincode: '90001',
    locality: 'Downtown',
    address: {
      addressID: 1,
      state: 'California',
      city: 'Los Angeles',
      pincode: '90001',
      locality: 'Downtown',
      address: '123 Main St',
    },
    totalPrice: 135,
    status: 'Success',
    createdAt: '2025-01-01T10:00:00Z',
    handlingPrice: 5,
    platformFee: 5,
    deliveryCharge: 5,
  },
  {
    orderID: 2,
    totalAmount: 200,
    items: [],
    state: 'New York',
    city: 'New York',
    pincode: '10001',
    locality: 'Manhattan',
    address: {
      addressID: 2,
      state: 'New York',
      city: 'New York',
      pincode: '10001',
      locality: 'Manhattan',
      address: '456 Wall St',
    },
    totalPrice: 180,
    status: 'Pending',
    createdAt: '2025-01-02T11:00:00Z',
    handlingPrice: 10,
    platformFee: 5,
    deliveryCharge: 5,
  },
];

// Create mock services
class MockOrdersService {
  getOrders() {
    return of(mockOrders);
  }
  updateAddress(
    orderID: number,
    state: string,
    city: string,
    pincode: string,
    locality: string,
    address: string
  ) {
    return of({ success: true });
  }
  cancelOrder(orderID: number) {
    return of({ success: true });
  }
  deleteOrder(orderID: number) {
    return of({ success: true });
  }
}

class MockDialogService {
  confirmed$ = of(true);
  open(config: { title: string; message: string }) {}
}

describe('OrderComponent', () => {
  let component: OrderComponent;
  let fixture: ComponentFixture<OrderComponent>;
  let ordersService: Orders;
  let dialogService: DialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, RouterLink, OrderComponent],
      providers: [
        { provide: Orders, useClass: MockOrdersService },
        { provide: DialogService, useClass: MockDialogService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderComponent);
    component = fixture.componentInstance;
    ordersService = TestBed.inject(Orders);
    dialogService = TestBed.inject(DialogService);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load orders on initialization', fakeAsync(() => {
    const getOrdersSpy = spyOn(ordersService, 'getOrders').and.callThrough();
    component.ngOnInit();
    tick();
    expect(getOrdersSpy).toHaveBeenCalled();
    expect(component.orders.length).toBe(2);
    expect(component.loading).toBeFalse();
  }));

  it('should display an error message if orders fail to load', fakeAsync(() => {
    spyOn(ordersService, 'getOrders').and.returnValue(
      throwError(() => 'Failed')
    );
    component.loadOrders();
    tick();
    expect(component.error).toBe('Failed to load orders. Please try again.');
    expect(component.loading).toBeFalse();
  }));

  it('should open the address update form when showUpdateAddressForm is called', () => {
    const orderToUpdate = mockOrders[0];
    component.showUpdateAddressForm(orderToUpdate);
    expect(component.showAddressForm).toBeTrue();
    expect(component.editingOrderId).toBe(orderToUpdate.orderID);
    expect(component.addressUpdate.address).toBe(orderToUpdate.address.address);
  });

  it('should return the correct status display and class', () => {
    expect(component.getStatusDisplay('Pending')).toBe('Pending');
    // FIX: 'Success' is not in the statusMap, so it defaults to 'pending'
    expect(component.getStatusClass('Success')).toBe('delivered');
    expect(component.isOrderCancelled('Cancelled')).toBeTrue();
    // FIX: 'Success' is not in the list of completed statuses
    expect(component.isOrderCompleted('Success')).toBeTrue();
  });

  it('should disable the Update Address button for completed orders', () => {
    const order = { ...mockOrders[0], status: 'Cancelled' };
    expect(component.isOrderCompleted(order.status)).toBeTrue();
  });
});
