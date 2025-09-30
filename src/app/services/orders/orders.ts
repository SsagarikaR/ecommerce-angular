import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { order } from '../../types/type';

@Injectable({
  providedIn: 'root',
})
export class Orders {
  private http = inject(HttpClient);
  private baseUrl = 'orders';

  createOrder(data: {
    totalAmount: number;
    items: {
      productID: number;
      quantity: number;
      price: number;
    }[];
    state: string;
    city: string;
    pincode: string;
    locality: string;
    address: string;
    totalPrice: number;
  }) {
    return this.http.post(`${this.baseUrl}`, data);
  }

  getOrders(): Observable<order[]> {
    return this.http.get<order[]>(`${this.baseUrl}`);
  }

  updateAddress(
    orderID: number,
    state: string,
    city: string,
    pincode: string,
    locality: string,
    address: string
  ) {
    return this.http.patch(`${this.baseUrl}`, {
      orderID,
      state,
      city,
      pincode,
      locality,
      address,
    });
  }

  cancelOrder(orderID: number) {
    return this.http.patch(`${this.baseUrl}/status`, { orderID });
  }

  updateOrderStatus(
    orderID: number,
    status: 'pending' | 'confirmed' | 'cancelled' | 'delivered'
  ) {
    return this.http.patch(`${this.baseUrl}/update-status`, {
      orderID,
      status,
    });
  }

  deleteOrder(orderID: number) {
    return this.http.delete(`${this.baseUrl}`, { body: { orderID } });
  }
}
