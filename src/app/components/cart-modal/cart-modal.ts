import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { cartItem } from '../../types/type';
import { CommonModule } from '@angular/common';
import { Cart } from '../../services/cart/cart';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-modal',
  imports: [CommonModule],
  templateUrl: './cart-modal.html',
  styleUrl: './cart-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartModal {
  private cartService = inject(Cart);
  router = inject(Router);
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
  proceedToCheckout() {
    this.close(); // Close the cart modal
    this.router.navigate(['/checkout']); // Navigate to checkout page
  }

  remove(item: cartItem) {
    this.cartService.deleteItem(item.cartItemID);
  }
}
