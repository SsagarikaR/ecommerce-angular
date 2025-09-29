import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Product } from '../../services/product/product';
import { product, review } from '../../types/type';
import { WishList } from '../../components/shared/wish-list-icon/wish-list-icon';
import { Wishlist } from '../../services/wishlist/wishlist';
import { Cart } from '../../services/cart/cart';
import { AddToCartButton } from '../../components/add-to-cart-button/add-to-cart-button';
import { Review } from '../../services/review/review';
import { Toast } from '../../services/toast/toast';
@Component({
  selector: 'app-product-detail',
  imports: [CommonModule, WishList, AddToCartButton, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail {
  private route = inject(ActivatedRoute);
  private productService = inject(Product);
  private wishlistService = inject(Wishlist);
  private cartService = inject(Cart);
  private reviewService = inject(Review);

  toast = inject(Toast);
  product: product | null = null;
  loading = true;
  id: number;

  selectedImage: string | null = null;

  // New properties for reviews
  reviews: review[] = [];
  newReviewDescription: string = '';
  newReviewRating: number = 0;
  reviewLoading: boolean = false;
  reviewError: string = '';

  constructor() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
  }

  ngOnInit(): void {
    if (this.id) {
      this.fetchProductDetails();
      this.fetchProductReviews();
    }
  }

  private fetchProductDetails(): void {
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

  private fetchProductReviews(): void {
    this.reviewLoading = true;
    this.reviewService.getReviewsOfProduct(this.id).subscribe({
      next: (res: any) => {
        this.reviews = res;
        this.reviewLoading = false;
      },
      error: (err) => {
        console.error('Error fetching reviews:', err);
        this.reviewError = 'Failed to load reviews.';
        this.reviewLoading = false;
      },
    });
  }

  addToCart(item: product) {
    this.cartService.addItem({
      productID: item.productID,
      quantity: 1,
    });
  }

  toggleWishlist(data: { wishlistID?: number; productID?: number }) {
    if (data.wishlistID) {
      this.wishlistService.deleteFromWishlist(data.wishlistID).subscribe({
        next: () => this.fetchProductDetails(),
        error: (err) => console.error(err),
      });
    } else if (data.productID) {
      this.wishlistService
        .addToWishlist({ productID: data.productID })
        .subscribe({
          next: () => this.fetchProductDetails(),
          error: (err) => console.error(err),
        });
    }
  }

  /**
   * Get average rating from all reviews
   */
  getAverageRating(): number {
    if (!this.reviews || this.reviews.length === 0) {
      return 0;
    }
    const totalRating = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    return totalRating / this.reviews.length;
  }

  /**
   * Get rating text based on numeric rating
   */
  getRatingText(rating: number): string {
    switch (rating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return '';
    }
  }

  /**
   * Get user initials from name for avatar
   */
  getInitials(name: string): string {
    if (!name) return 'U';

    const names = name.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }

    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  }

  /**
   * Enhanced submit review method with validation
   */
  submitReview(): void {
    // Validation
    if (this.newReviewRating === 0) {
      this.toast.show('Please select a rating');
      return;
    }

    if (this.newReviewDescription.trim().length < 10) {
      this.toast.show('Review must be at least 10 characters long');
      return;
    }

    if (this.newReviewDescription.length > 500) {
      this.toast.show('Review must be less than 500 characters');
      return;
    }

    if (this.product) {
      this.reviewService
        .addReview({
          productID: this.product.productID,
          rating: this.newReviewRating,
          description: this.newReviewDescription.trim(),
        })
        .subscribe({
          next: (res) => {
            this.toast.show('Thank you for your review!');
            // Refresh the review list after a successful submission
            this.fetchProductReviews();

            // Reset form fields
            this.newReviewDescription = '';
            this.newReviewRating = 0;
          },
          error: (err) => {
            console.error('Error adding review:', err);
            alert('Failed to submit review. Please try again.');
          },
        });
    }
  }
}
