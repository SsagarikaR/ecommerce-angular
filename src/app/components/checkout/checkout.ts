import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { cartItem } from '../../types/type';
import { Cart } from '../../services/cart/cart';
import { Orders } from '../../services/orders/orders';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Toast } from '../../services/toast';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private toast = inject(Toast);
  private cartService = inject(Cart);
  private ordersService = inject(Orders);
  private router = inject(Router);

  cartItems: cartItem[] = [];
  currentStep = 1;
  showModal = false;
  isLoading = false;

  orderData = {
    state: '',
    city: '',
    pincode: '',
    locality: '',
    address: '',
  };

  ngOnInit(): void {
    this.cartService.getCartItems().subscribe((items) => {
      this.cartItems = items;
      // If no items, redirect back
      if (items.length === 0) {
        this.router.navigate(['/']);
      }
    });
  }

  get totalAmount() {
    return this.cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  get totalPrice() {
    // Add any additional charges, taxes, delivery fees here
    return this.totalAmount;
  }

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goBack() {
    this.router.navigate(['/']);
  }

  showConfirmModal() {
    this.showModal = true;
  }

  hideConfirmModal() {
    this.showModal = false;
  }

  async confirmOrder() {
    this.isLoading = true;

    try {
      const orderPayload = {
        totalAmount: this.cartItems.length,
        totalPrice: this.totalPrice,
        items: this.cartItems.map((item) => ({
          productID: item.productID,
          quantity: item.quantity,
          price: item.productPrice,
        })),
        state: this.orderData.state,
        city: this.orderData.city,
        pincode: this.orderData.pincode,
        locality: this.orderData.locality,
        address: this.orderData.address,
      };

      this.ordersService.createOrder(orderPayload).subscribe({
        next: (response) => {
          this.hideConfirmModal();
          this.router.navigate(['/orders']);
        },
        error: (error) => {
          this.toast.show(
            error.error.message || 'Failed to create order. Please try again.',
            'error'
          );
          this.isLoading = false;
        },
      });
    } catch (error) {
      console.error('Error in order confirmation:', error);
      this.toast.show('An error occurred. Please try again.', 'error');
      this.isLoading = false;
    }
  }
}
