import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Orders } from '../../services/orders/orders';
import { Order } from '../../types/type';
import { DialogService } from '../../services/dialog';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class OrderComponent implements OnInit {
  orderService = inject(Orders);
  private dialogService = inject(DialogService);

  orders: Order[] = [];
  loading = false;
  error = '';

  // Address update form
  addressUpdate = {
    orderID: 0,
    state: '',
    city: '',
    pincode: '',
    locality: '',
    address: '',
  };

  showAddressForm = false;
  editingOrderId = 0;

  ngOnInit() {
    this.loadOrders();
  }

  // TrackBy functions for performance optimization
  trackByOrderId(index: number, order: Order): number {
    return order.orderID || index;
  }

  trackByItemId(index: number, item: any): number {
    return item.orderItemID || index;
  }

  // Load all orders
  loadOrders() {
    this.loading = true;
    this.error = '';

    this.orderService.getOrders().subscribe({
      next: (result: Order[]) => {
        this.orders = result;
        this.loading = false;
        console.log('Orders loaded:', result);
      },
      error: (error) => {
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
        console.error('Error loading orders:', error);
      },
    });
  }

  // Update order address
  updateOrderAddress() {
    if (!this.validateAddressForm()) {
      return;
    }

    this.loading = true;

    this.orderService
      .updateAddress(
        this.addressUpdate.orderID,
        this.addressUpdate.state,
        this.addressUpdate.city,
        this.addressUpdate.pincode,
        this.addressUpdate.locality,
        this.addressUpdate.address
      )
      .subscribe({
        next: (result) => {
          console.log('Address updated:', result);
          this.resetAddressForm();
          this.loadOrders(); // Refresh the list
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Failed to update address. Please try again.';
          this.loading = false;
          console.error('Error updating address:', error);
        },
      });
  }

  // Cancel order with dialog confirmation
  cancelOrder(orderID: number) {
    this.dialogService.open({
      title: 'Cancel Order',
      message:
        'Are you sure you want to cancel this order? This action cannot be undone.',
    });

    const subscription = this.dialogService.confirmed$.subscribe(
      (confirmed: boolean) => {
        if (confirmed) {
          this.loading = true;
          this.orderService.cancelOrder(orderID).subscribe({
            next: (result) => {
              console.log('Order cancelled:', result);
              this.loadOrders();
              this.loading = false;
            },
            error: (error) => {
              this.error = 'Failed to cancel order. Please try again.';
              this.loading = false;
              console.error('Error cancelling order:', error);
            },
          });
        }
        subscription.unsubscribe();
      }
    );
  }

  // Delete order with dialog confirmation
  deleteOrder(orderID: number) {
    this.dialogService.open({
      title: 'Delete Order',
      message:
        'Are you sure you want to permanently delete this order? This action cannot be undone and will remove all order history.',
    });

    const subscription = this.dialogService.confirmed$.subscribe(
      (confirmed: boolean) => {
        if (confirmed) {
          this.loading = true;
          this.orderService.deleteOrder(orderID).subscribe({
            next: (result) => {
              console.log('Order deleted:', result);
              this.loadOrders(); // Refresh the list
              this.loading = false;
            },
            error: (error) => {
              this.error = 'Failed to delete order. Please try again.';
              this.loading = false;
              console.error('Error deleting order:', error);
            },
          });
        }
        subscription.unsubscribe();
      }
    );
  }

  // Show address update form for specific order
  showUpdateAddressForm(order: Order) {
    this.editingOrderId = order.orderID || 0;
    console.log(order);
    this.addressUpdate = {
      orderID: order.orderID || 0,
      state: order.state || '',
      city: order.city || '',
      pincode: order.pincode || '',
      locality: order.locality || '',
      address: order.address.address || '',
    };
    this.showAddressForm = true;
  }

  // Status helper methods
  getStatusClass(status: string | undefined): string {
    if (!status) return 'pending';

    const statusMap: { [key: string]: string } = {
      pending: 'pending',
      confirmed: 'confirmed',
      processing: 'processing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled',
      returned: 'returned',
    };

    return statusMap[status.toLowerCase()] || 'pending';
  }

  getStatusDisplay(status: string | undefined): string {
    if (!status) return 'Pending';

    const statusMap: { [key: string]: string } = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
    };

    return statusMap[status.toLowerCase()] || status;
  }

  isOrderCancelled(status: string | undefined): boolean {
    return status?.toLowerCase() === 'cancelled';
  }

  isOrderCompleted(status: string | undefined): boolean {
    const completedStatuses = ['delivered', 'cancelled', 'returned'];
    return completedStatuses.includes(status?.toLowerCase() || '');
  }

  // Form validation
  validateAddressForm(): boolean {
    if (
      !this.addressUpdate.state?.trim() ||
      !this.addressUpdate.city?.trim() ||
      !this.addressUpdate.pincode?.trim() ||
      !this.addressUpdate.locality?.trim() ||
      !this.addressUpdate.address?.trim()
    ) {
      this.error = 'Please fill in all address fields';
      return false;
    }

    // Validate pincode format
    const pincodePattern = /^[0-9]{6}$/;
    if (!pincodePattern.test(this.addressUpdate.pincode.trim())) {
      this.error = 'Please enter a valid 6-digit pincode';
      return false;
    }

    return true;
  }

  isAddressFormValid(): boolean {
    return !!(
      this.addressUpdate.state?.trim() &&
      this.addressUpdate.city?.trim() &&
      this.addressUpdate.pincode?.trim() &&
      this.addressUpdate.locality?.trim() &&
      this.addressUpdate.address?.trim() &&
      /^[0-9]{6}$/.test(this.addressUpdate.pincode.trim())
    );
  }

  // Reset address form
  resetAddressForm() {
    this.addressUpdate = {
      orderID: 0,
      state: '',
      city: '',
      pincode: '',
      locality: '',
      address: '',
    };
    this.showAddressForm = false;
    this.editingOrderId = 0;
  }

  // Modal interaction methods
  cancelAddressUpdate() {
    this.resetAddressForm();
  }

  onModalOverlayClick(event: Event) {
    // Close modal when clicking on overlay
    this.cancelAddressUpdate();
  }
}
