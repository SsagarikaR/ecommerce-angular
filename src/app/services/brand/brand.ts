import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { brand } from '../../types/type';

@Injectable({
  providedIn: 'root',
})
export class Brand {
  http = inject(HttpClient);
  constructor() {}

  getBrands(queryParams: { brandID?: number } = {}) {
    const params = new HttpParams({
      fromObject: queryParams,
    });
    return this.http.get('http://localhost:5000/brands', { params });
  }
  postBrands(data: Partial<brand>) {
    return this.http.post('http://localhost:5000/brands', data);
  }
  updateBrands(data: Partial<brand>) {
    return this.http.patch('http://localhost:5000/brands', data);
  }
  deleteBrands(brandID: number) {
    return this.http.delete('http://localhost:5000/brands', {
      body: { brandID },
    });
  }
}
