import { Component, inject } from '@angular/core';
import { cartItem } from '../../types/type';
import { CommonModule } from '@angular/common';
import { Cart } from '../../services/cart/cart';

@Component({
  selector: 'app-cart-modal',
  imports: [CommonModule],
  templateUrl: './cart-modal.html',
  styleUrl: './cart-modal.css',
})
export class CartModal {
  private cartService = inject(Cart);

  cartItems: cartItem[] = [];
  isOpen = false;

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe((items) => {
      this.cartItems = items;
    });
    this.cartService.cartModalOpen$.subscribe((state) => {
      this.isOpen = state;
    });
  }

  close() {
    this.cartService.closeCartModal();
  }

  updateQuantity(item: cartItem, quantity: number) {
    this.cartService.updateItem({
      cartItemID: item.cartItemID,
      quantity,
    });
  }

  remove(item: cartItem) {
    this.cartService.deleteItem(item.cartItemID);
  }

  get totalAmount() {
    return this.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }
}
