import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Wishlist {
  http = inject(HttpClient);
  addToWishlist(data: { productID: number }) {
    return this.http.post('http://localhost:5000/wishlist', data);
  }
  fetchFromWishlist() {
    return this.http.get('http://localhost:5000/wishlist');
  }
  fetchFromWishlistByItemId(queryParams: { id: number }) {
    const params = new HttpParams({
      fromObject: queryParams,
    });
    return this.http.get('http://localhost:5000/wishlist', { params });
  }
  deleteFromWishlist(wishListID: number) {
    return this.http.delete('http://localhost:5000/wishlist', {
      body: { wishListID },
    });
  }
}
