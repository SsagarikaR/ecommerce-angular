import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { product } from '../../types/type';
import { Cart } from '../../services/cart/cart';

@Component({
  selector: 'app-add-to-cart-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-to-cart-button.html',
  styleUrl: './add-to-cart-button.css',
})
export class AddToCartButton {
  @Input() item!: product;
  private cartService = inject(Cart);

  addToCart() {
    if (!this.item || this.item.stock === 0) return;
    this.cartService.addItem({
      productID: this.item.productID,
      quantity: 1,
    });
  }
}
