import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductCard } from '../../components/product-card/product-card';
import { product } from '../../types/type';
import { Product } from '../../services/product/product';

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

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const name = params['search'];
      const categoryID = params['categoryID']
        ? +params['categoryID']
        : undefined;
      this.page = 1;
      this.fetchProducts({ name, categoryID });
    });
  }

  fetchProducts(options: { name?: string; categoryID?: number } = {}) {
    this.loading = true;

    const query = {
      page: this.page,
      limit: this.limit,
      ...(options.name ? { name: options.name } : {}),
      ...(options.categoryID ? { categoryID: options.categoryID } : {}),
    };

    this.productService.get(query).subscribe({
      next: (result: product[]) => {
        this.products = result;
        this.totalItems = result[0]?.totalCount || this.products.length || 0;
        this.totalPages = Math.ceil(this.totalItems / this.limit);
        this.loading = false;
      }
    });
    this.loading = false;
  }

  goToPage(pageNum: number) {
    if (pageNum >= 1 && pageNum <= this.totalPages) {
      this.page = pageNum;
      this.fetchProducts(); // reuses current query params
    }
  }
}
