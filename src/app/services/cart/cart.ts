import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { cartItem } from '../../types/type';
import { HttpClient } from '@angular/common/http';
import { Toast } from '../toast';

@Injectable({
  providedIn: 'root',
})
export class Cart {
  http = inject(HttpClient);

  private cartItems = new BehaviorSubject<cartItem[]>([]);
  private readonly cartItems$ = this.cartItems.asObservable();

  // 🔹 modal state
  private cartModalOpen = new BehaviorSubject<boolean>(false);
  cartModalOpen$ = this.cartModalOpen.asObservable();

  constructor(private toast: Toast) {
    this.http.get<cartItem[]>('http://localhost:5000/cart').subscribe({
      next: (result) => this.cartItems.next(result),
      error: (err) => {
        console.error('Cart item fetch failed');
        alert(err.error?.message || 'Cart item fetch failed');
      },
    });
  }

  getCartItems(): Observable<cartItem[]> {
    return this.cartItems$;
  }

  // 🔹 open/close modal
  openCartModal() {
    console.log('open');
    this.cartModalOpen.next(true);
  }
  closeCartModal() {
    console.log('close');
    this.cartModalOpen.next(false);
  }

  addItem(item: { productID: number; quantity: number }): void {
    const currentCart = this.cartItems.getValue();
    const existingItem = currentCart.find(
      (ci) => ci.productID === item.productID
    );

    if (existingItem) {
      this.updateItem({
        cartItemID: existingItem.cartItemID,
        quantity: existingItem.quantity + item.quantity,
      });
    } else {
      this.http
        .post<{ cartItem: cartItem; message: string; cartItemID: number }>(
          'http://localhost:5000/cart',
          item
        )
        .subscribe({
          next: (result) => {
            let currentCart = this.cartItems.getValue();
            const newCartItem = result.cartItem;
            currentCart = [...currentCart, newCartItem];
            this.cartItems.next(currentCart);
          },
          error: (err) => {
            console.error('Failed to add item');
            alert(err.error?.message || 'Add item failed');
          },
        });
    }

    // 🔹 always open modal when item added
    this.openCartModal();
  }

  updateItem(data: { cartItemID: number; quantity: number }): void {
    const currentCart = this.cartItems.getValue();
    const updatedCart = currentCart.map((ci) =>
      ci.cartItemID === data.cartItemID
        ? { ...ci, quantity: data.quantity }
        : ci
    );
    this.cartItems.next(updatedCart);

    this.http
      .patch<{ cartItem: cartItem; message: string; cartItemID: number }>(
        `http://localhost:5000/cart`,
        data
      )
      .subscribe({
        error: (err) => {
          console.error('Failed to update item');
          this.toast.show(err.error?.message || 'Update item failed', 'error');
        },
      });
  }

  deleteItem(productID: number): void {
    const currentCart = this.cartItems.getValue();
    const updatedCart = currentCart.filter((ci) => ci.productID !== productID);
    this.cartItems.next(updatedCart);

    this.http.delete(`http://localhost:5000/cart/${productID}`).subscribe({
      error: (err) => {
        console.error('Failed to delete item');
        this.toast.show(err.error?.message || 'Delete item failed', 'error');
      },
    });
  }
}
