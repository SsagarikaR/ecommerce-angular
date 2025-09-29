import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { category, preferences } from '../../types/type';

@Injectable({
  providedIn: 'root',
})
export class Preferences {
  http = inject(HttpClient);
  constructor() { }
  getPrefernces(queryParams: { userID?: number } = {}) {
    const params = new HttpParams({
      fromObject: queryParams,
    });
    return this.http.get<preferences[]>('prefernces', { params });
  }

  postPrefernces(data: any) {
    return this.http.post('prefernces', data);
  }

  updatePrefernces(data: Partial<category>) {
    return this.http.patch('prefernces', data);
  }
}
