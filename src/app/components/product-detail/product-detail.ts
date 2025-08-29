import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Product } from '../../services/product/product';
import { product } from '../../types/type';
import { WishList } from '../shared/wish-list/wish-list';
import { Wishlist } from '../../services/wishlist/wishlist';
import { Cart } from '../../services/cart/cart';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, WishList],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  private route = inject(ActivatedRoute);
  private productService = inject(Product);
  private wishlistService = inject(Wishlist);
  private cartService = inject(Cart);

  product: product | null = null;
  loading = true;
  id: number;

  selectedImage: string | null = null;

  constructor() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    if (this.id) {
      this.productService.get({ id: this.id }).subscribe({
        next: (res: any) => {
          this.product = Array.isArray(res) ? res[0] : res;

          this.selectedImage = this.product?.productThumbnail || null;

          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching product', err);
          this.loading = false;
        },
      });
    }
  }

  addToCart(item: product) {
    console.log('Added to cart', item);
    this.cartService.addItem({ productID: item.productID, quantity: 1 });
    // this.cartService.openCartModal(); // 👈 enable if you want drawer to show immediately
  }

  toggleWishlist(data: { wishlistID?: number; productID?: number }) {
    if (data.wishlistID) {
      this.wishlistService.deleteFromWishlist(data.wishlistID).subscribe({
        next: () => this.ngOnInit(),
        error: (err) => console.error(err),
      });
    } else if (data.productID) {
      this.wishlistService
        .addToWishlist({ productID: data.productID })
        .subscribe({
          next: () => this.ngOnInit(),
          error: (err) => console.error(err),
        });
    }
  }
}
