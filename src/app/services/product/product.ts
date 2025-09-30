import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { product } from '../../types/type';

@Injectable({
  providedIn: 'root',
})
export class Product {
  http = inject(HttpClient);
  add(body: Partial<product>) {
    return this.http.post('products', body);
  }
  get(
    queryParams: {
      id?: number;
      page?: number;
      limit?: number;
      name?: string;
      price?: string;
      categoryID?: number;
    } = {}
  ) {
    const params = new HttpParams({
      fromObject: queryParams,
    });
    return this.http.get<product[]>('products', { params });
  }
  update(data: Partial<product>) {
    return this.http.patch<{ message: string, success: boolean }>('products', data);
  }
  delete(productID: number) {
    return this.http.delete('products', {
      body: { productID },
    });
  }
}
