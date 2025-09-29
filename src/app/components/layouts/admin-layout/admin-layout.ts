import { Component, inject } from '@angular/core';
import {
  Router,
  RouterOutlet,
  NavigationEnd,
  RouterLink,
} from '@angular/router';
import { DashboardSidebar } from '../dashboard-sidebar/dashboard-sidebar';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, DashboardSidebar, RouterLink, CommonModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  router = inject(Router);
  pageTitle = '';
  currentRoute = '';
  isAddRoute = true;

  ngOnInit() {
    // Run once on init
    this.updateTitle(this.router.url);

    // Run again on every navigation inside admin
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        const nav = event as NavigationEnd;
        this.updateTitle(nav.urlAfterRedirects);
      });
  }

  private capitalize(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private updateTitle(url: string) {
    const segments = url.split('/').filter(Boolean);
    this.currentRoute = segments[segments.length - 1] || '';

    // If last is "add", show the resource name (2nd to last)
    const resourceSegment =
      this.currentRoute.toLowerCase() === 'add'
        ? segments[segments.length - 1]
        : this.currentRoute;

    this.pageTitle = this.capitalize(resourceSegment || 'Dashboard');
    this.isAddRoute = this.currentRoute.toLowerCase() !== 'add';
  }
}
