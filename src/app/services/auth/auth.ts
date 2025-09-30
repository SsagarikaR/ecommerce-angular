import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { user } from '../../types/type';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  http = inject(HttpClient);
  private userRole = new BehaviorSubject<string | null>(null);
  userRole$ = this.userRole.asObservable();

  signup(data: {
    name: string;
    email: string;
    contactNo: string;
    password: string;
  }) {
    return this.http.post<user>('auth/signup', data);
  }
  login(data: { email: string; password: string }) {
    return this.http.post<user>('auth/login', data);
  }
  fetchUserProfile() {
    return this.http.get('user').subscribe({
      next: (user: any) => {
        this.userRole.next(user.role);
      },
      error: () => this.userRole.next(null),
    });
  }

  isAdmin(): boolean {
    return this.userRole.getValue() === 'Admin';
  }

  clearUser(): void {
    this.userRole.next(null);
  }
}
