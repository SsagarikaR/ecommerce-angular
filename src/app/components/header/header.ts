import { CommonModule, LowerCasePipe } from '@angular/common';
import { Component, HostListener, inject, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { category } from '../../types/type';
import { Category } from '../../services/category';
type Crumb = { label: string; url?: string };

@Component({
  selector: 'app-header',
  imports: [RouterLink, LowerCasePipe, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  private categoryService = inject(Category);
  router = inject(Router);
  categories: category[] = [];
  dropdownOpen = false;

  @Input() breadcrumb: Crumb[] = [
    { label: 'Home', url: '/' },
    { label: 'Men', url: '/category/men' },
    { label: 'Shoes', url: '/category/men/shoes' },
    { label: 'Running' },
  ];

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data: any) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
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

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.dropdownOpen = false;
    }
  }
}
