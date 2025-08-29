import { Component, inject } from '@angular/core';
import { product } from '../../types/type';
import { Product } from '../../services/product/product';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductCard } from '../product-card/product-card';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, ProductCard],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
  private route = inject(ActivatedRoute);
  private productService = inject(Product);

  products: product[] = [];
  loading = true;

  page = 1;
  limit = 5;
  totalItems = 0;
  totalPages = 0;
  name: string | undefined;

  ngOnInit(): void {
    const name = this.route.snapshot.queryParamMap.get('search');
    this.fetchProducts(name || undefined);
  }

  fetchProducts(name?: string) {
    this.loading = true;
    this.productService
      .get({ page: this.page, limit: this.limit, name: name })
      .subscribe({
        next: (result: any) => {
          // Assuming backend returns { data: [], total: number }
          this.products = result;
          this.totalItems = result[0].totalCount || this.products.length || 0;
          this.totalPages = Math.ceil(this.totalItems / this.limit);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching products', err);
          this.loading = false;
        },
      });
  }

  goToPage(pageNum: number) {
    if (pageNum >= 1 && pageNum <= this.totalPages) {
      this.page = pageNum;
      this.fetchProducts();
    }
  }
}
