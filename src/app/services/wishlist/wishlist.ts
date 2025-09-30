import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { wishlistItem } from '../../types/type';

@Injectable({
  providedIn: 'root',
})
export class Wishlist {
  http = inject(HttpClient);
  addToWishlist(data: { productID: number }) {
    return this.http.post<{ message: string, wishlistID: number }>('wishlist', data);
  }
  fetchFromWishlist() {
    return this.http.get<wishlistItem[]>('wishlist');
  }
  fetchFromWishlistByItemId(queryParams: { id: number }) {
    const params = new HttpParams({
      fromObject: queryParams,
    });
    return this.http.get('wishlist', { params });
  }
  deleteFromWishlist(wishListID: number) {
    return this.http.delete<{ message: string }>('wishlist', {
      body: { wishListID },
    });
  }
}
