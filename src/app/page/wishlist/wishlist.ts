import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Wishlist } from '../../services/wishlist/wishlist';
import { Toast } from '../../services/toast/toast';
import { RouterLink } from '@angular/router';
import { Cart } from '../../services/cart/cart';
import { product, wishlistItem } from '../../types/type';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class WishlistPage implements OnInit {
  private wishlistService = inject(Wishlist);
  private toast = inject(Toast);
  private cartService = inject(Cart);

  wishlist: wishlistItem[] = [];
  loading = true;

  ngOnInit() {
    this.fetchWishlist();
  }

  fetchWishlist() {
    this.loading = true;
    this.wishlistService.fetchFromWishlist().subscribe({
      next: (items: wishlistItem[]) => {
        this.wishlist = items;
        this.loading = false;
      },
    });
  }

  addToCart(item: product) {
    this.cartService.addItem({
      productID: item.productID,
      quantity: 1,
    });
  }

  removeItem(wishListID: number) {
    this.wishlistService.deleteFromWishlist(wishListID).subscribe({
      next: (result) => {
        this.toast.show(result.message || 'Removed from wishlist', 'success');
        this.fetchWishlist();
      },
    });
  }
}
