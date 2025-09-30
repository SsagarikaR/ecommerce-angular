import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { category } from '../../types/type';

@Injectable({
  providedIn: 'root',
})
export class Category {
  http = inject(HttpClient);

  constructor() { }
  getCategories(queryParams: { categoryID?: number } = {}) {
    const params = new HttpParams({
      fromObject: queryParams,
    });
    return this.http.get<category[]>('categories', { params });
  }

  postCategories(data: Partial<category>) {
    return this.http.post('categories', data);
  }

  updateCategories(data: Partial<category>) {
    return this.http.patch('categories', data);
  }
  deleteCategory(categoryID: number) {
    return this.http.delete('categories', { body: { categoryID } });
  }
}
