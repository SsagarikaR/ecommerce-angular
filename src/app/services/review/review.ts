import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { inject } from '@angular/core/primitives/di';
import { review } from '../../types/type';

@Injectable({
  providedIn: 'root',
})
export class Review {
  private http = inject(HttpClient);

  // Service method to add a new review
  addReview(reviewData: {
    productID: number;
    rating: number;
    description: string;
  }) {
    const url = `reviews`;
    return this.http.post(url, reviewData);
  }

  // Service method to get reviews for a product
  getReviewsOfProduct(productID: number) {
    const url = `reviews/${productID}`;
    return this.http.get<review[]>(url);
  }
}
