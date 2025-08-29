import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  http = inject(HttpClient);
  constructor() {}
  signup(data: {
    name: string;
    email: string;
    contactNo: string;
    password: string;
  }) {
    return this.http.post('http://localhost:5000/auth/signup', data);
  }
  login(data: { email: string; password: string }) {
    return this.http.post('http://localhost:5000/auth/login', data);
  }
}
