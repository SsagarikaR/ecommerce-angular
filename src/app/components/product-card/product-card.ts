import { Component, inject, Input } from '@angular/core';
import { product } from '../../types/type';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishList } from '../shared/wish-list/wish-list';
import { Wishlist } from '../../services/wishlist/wishlist';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterLink, WishList],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() item!: product;
  isExpanded = false;
  private wishlistService = inject(Wishlist);

  toggleDescription() {
    this.isExpanded = !this.isExpanded;
  }

  get hasLongDescription(): boolean {
    return (this.item?.productDescription?.length || 0) > 60;
  }

  toggleWishlist(data: {
    wishlistID: number | undefined;
    productID: number | undefined;
  }) {
    console.log('Toggle wishlist for product:', data.wishlistID);

    // Call service API
    if (data.wishlistID) {
      this.wishlistService.deleteFromWishlist(data.wishlistID).subscribe({
        next: () => {
          this.item.wishlist = 'no';
          this.item.wishListID = undefined;
        },
        error: (err) => console.error(err),
      });
    } else if (data.productID) {
      this.wishlistService
        .addToWishlist({ productID: data.productID })
        .subscribe({
          next: (res: any) => {
            this.item.wishlist = 'yes';
            this.item.wishListID = res.wishlistID;
          },
          error: (err) => console.error(err),
        });
    }
  }
}
