import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { category } from '../types/type';

@Injectable({
  providedIn: 'root',
})
export class Category {
  http = inject(HttpClient);

  constructor() {}
  getCategories(queryParams: { categoryID?: number } = {}) {
    const params = new HttpParams({
      fromObject: queryParams,
    });
    return this.http.get('http://localhost:5000/categories', { params });
  }

  postCategories(data: any) {
    return this.http.post('http://localhost:5000/categories', data);
  }

  updateCategories(data: Partial<category>) {
    return this.http.patch('http://localhost:5000/categories', data);
  }
}
