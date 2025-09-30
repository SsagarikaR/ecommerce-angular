import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
} from '@angular/router';
import type { cartItem, category } from '../../../types/type';
import { Category } from '../../../services/category/category';
import { Cart } from '../../../services/cart/cart';
import { filter } from 'rxjs';
import { Auth } from '../../../services/auth/auth';
import { CookieService } from 'ngx-cookie-service';

interface Crumb {
  label: string;
  url?: string;
}

@Component({
  selector: 'app-header',
  imports: [RouterLink, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  private categoryService = inject(Category);
  private activatedRoute = inject(ActivatedRoute);
  router = inject(Router);
  cartService = inject(Cart);
  cartItems: cartItem[] = [];
  categories: category[] = [];
  dropdownOpen = false;
  profileDropdownOpen = false;
  authService = inject(Auth);
  isAdmin = false;
  private cookieService = inject(CookieService);

  breadcrumb: Crumb[] = [];
  ngOnInit() {
    this.authService.fetchUserProfile()
    this.authService.userRole$.subscribe((role) => {

      this.isAdmin = role === 'Admin';
    });
    this.loadCategories();
    this.cartService.getCartItems().subscribe((items) => {
      this.cartItems = items;
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.breadcrumb = this.buildBreadcrumb(this.activatedRoute.root);
      });
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data: category[]) => {
        this.categories = data;
      },
    });
  }

  onSearch(q: string) {
    if (q) {
      this.router.navigateByUrl('/products?search=' + q);
    }
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleProfileDropdown() {
    this.profileDropdownOpen = !this.profileDropdownOpen;
  }

  openCart() {
    this.cartService.openCartModal();
  }

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.dropdownOpen = false;
      this.profileDropdownOpen = false;
    }
  }

  signOut() {
    this.cookieService.delete('auth_token', '/');

    this.authService.clearUser();

    this.router.navigate(['/login']);
  }

  private buildBreadcrumb(
    route: ActivatedRoute,
    url = '',
    crumbs: Crumb[] = [],
  ): Crumb[] {
    if (crumbs.length === 0 && this.router.url !== '/') {
      crumbs.push({ label: 'Home', url: '/' });
    }

    const children: ActivatedRoute[] = route.children;

    if (children.length === 0) {
      return crumbs;
    }

    for (const child of children) {
      const routeConfig = child.routeConfig;

      if (!routeConfig) continue;

      const routeURL = routeConfig.path ? routeConfig.path : '';
      const nextUrl = routeURL ? `${url}/${routeURL}` : url;
      const label =
        routeConfig.data?.['breadcrumb'] ??
        (routeURL === '' ? 'Home' : routeURL);

      if (
        label &&
        !(label === 'Home' && crumbs.some((c) => c.label === 'Home'))
      ) {
        crumbs.push({ label, url: nextUrl });
      }

      this.buildBreadcrumb(child, nextUrl, crumbs);
    }

    return crumbs;
  }
}
