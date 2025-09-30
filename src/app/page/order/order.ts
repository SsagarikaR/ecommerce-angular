import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Orders } from '../../services/orders/orders';
import { order, orderItem } from '../../types/type';
import { DialogService } from '../../services/dialog/dialog';
import { RouterLink } from '@angular/router';
type Status =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'success';

@Component({
  selector: 'app-order ',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './order.html',
  styleUrl: './order.css',
})
export class OrderComponent implements OnInit {
  orderService = inject(Orders);
  private dialogService = inject(DialogService);

  orders: order[] = [];
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
  trackByOrderId(index: number, order: order): number {
    return order.orderID || index;
  }

  trackByItemId(index: number, item: orderItem): number {
    return item.orderItemID || index;
  }

  // Load all orders
  loadOrders() {
    this.loading = true;
    this.error = '';

    this.orderService.getOrders().subscribe({
      next: (result: order[]) => {
        this.orders = result;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
        console.error('Error loading orders:', error);
      },
    });
  }

  // Update order  address
  updateOrderAddress() {
    if (!this.isAddressFormValid()) {
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
        this.addressUpdate.address,
      )
      .subscribe({
        next: () => {
          this.resetAddressForm();
          this.loadOrders(); // Refresh the list
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  // Cancel order  with dialog confirmation
  cancelOrder(orderID: number) {
    this.dialogService.open({
      title: 'Cancel order ',
      message:
        'Are you sure you want to cancel this order ? This action cannot be undone.',
    });

    const subscription = this.dialogService.confirmed$.subscribe(
      (confirmed: boolean) => {
        if (confirmed) {
          this.loading = true;
          this.orderService.cancelOrder(orderID).subscribe({
            next: () => {
              this.loadOrders();
              this.loading = false;
            },
            error: (error) => {
              this.error = 'Failed to cancel order . Please try again.';
              this.loading = false;
              console.error('Error cancelling order :', error);
            },
          });
        }
        subscription.unsubscribe();
      },
    );
  }

  // Delete order  with dialog confirmation
  deleteOrder(orderID: number) {
    this.dialogService.open({
      title: 'Delete order ',
      message:
        'Are you sure you want to permanently delete this order ? This action cannot be undone and will remove all order  history.',
    });

    const subscription = this.dialogService.confirmed$.subscribe(
      (confirmed: boolean) => {
        if (confirmed) {
          this.loading = true;
          this.orderService.deleteOrder(orderID).subscribe({
            next: () => {
              this.loadOrders(); // Refresh the list
              this.loading = false;
            },
            complete: () => {
              this.loading = false;
            },
          });
        }
        subscription.unsubscribe();
      },
    );
  }

  // Show address update form for specific order
  showUpdateAddressForm(order: order) {
    this.editingOrderId = order.orderID || 0;
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

    const statusMap: Record<Status, string> = {
      pending: 'pending',
      confirmed: 'confirmed',
      processing: 'processing',
      shipped: 'shipped',
      delivered: 'delivered',
      cancelled: 'cancelled',
      returned: 'returned',
      success: 'delivered',
    };
    return statusMap[status.toLowerCase() as Status] || 'pending';
  }

  getStatusDisplay(status: string | undefined): string {
    if (!status) return 'Pending';

    const statusMap: Record<Status, string> = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
      returned: 'Returned',
      success: 'Delivered', // Add 'success' to handle the mock data
    };

    return statusMap[status.toLowerCase() as Status] || status;
  }

  isOrderCancelled(status: string | undefined): boolean {
    return status?.toLowerCase() === 'cancelled';
  }

  isOrderCompleted(status: string | undefined): boolean {
    const completedStatuses = ['delivered', 'cancelled', 'returned', 'success'];
    return completedStatuses.includes(status?.toLowerCase() || '');
  }

  // Form validation
  isAddressFormValid(): boolean {
    const pincodePattern = /^[0-9]{6}$/;
    return (
      !!this.addressUpdate.state?.trim() &&
      !!this.addressUpdate.city?.trim() &&
      !!this.addressUpdate.pincode?.trim() &&
      !!this.addressUpdate.locality?.trim() &&
      !!this.addressUpdate.address?.trim() &&
      pincodePattern.test(this.addressUpdate.pincode.trim())
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

  onModalOverlayClick(e: Event) {
    if (e.target instanceof HTMLDivElement) {
      this.cancelAddressUpdate();
    }
  }
}
