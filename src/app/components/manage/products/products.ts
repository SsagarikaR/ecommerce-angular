import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../services/product/product';
import { DialogService } from '../../../services/dialog/dialog';
import { product } from '../../../types/type';
import { Toast } from '../../../services/toast/toast';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatCheckboxModule,
    RouterLink,
    FormsModule,
  ],
  templateUrl: './products.html',
  styleUrl: './products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Products {
  products: product[] = [];
  filteredProducts: product[] = [];
  selectedProducts: Set<number> = new Set();
  isLoading = false;
  searchTerm = '';
  Math = Math;
  toast = inject(Toast);

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalProducts = 0;
  totalPages = 0;

  // Sorting
  sortBy = 'productName';
  sortOrder: 'asc' | 'desc' = 'asc';

  private productService = inject(Product);
  private dialog = inject(DialogService);
  private router = inject(Router);

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading = true;
    const queryParams = {
      page: this.currentPage,
      limit: this.pageSize,
      name: this.searchTerm,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };

    this.productService.get(queryParams).subscribe({
      next: (result: any) => {
        this.totalProducts = result[0].totalCount || 0;
        if (Array.isArray(result)) {
          this.products = result;
        } else {
          this.products = [];
          this.totalProducts = 0;
        }

        this.filteredProducts = [...this.products];
        this.totalPages = Math.ceil(this.totalProducts / this.pageSize);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.toast.show('Error loading products', 'error');
        this.isLoading = false;
        this.products = [];
        this.filteredProducts = [];
      },
    });
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase();
    this.currentPage = 1;
    this.loadProducts();
  }

  clearSearch() {
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadProducts();
  }

  sortProducts(field: string) {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.loadProducts();
  }

  toggleProductSelection(productId: number) {
    if (this.selectedProducts.has(productId)) {
      this.selectedProducts.delete(productId);
    } else {
      this.selectedProducts.add(productId);
    }
  }

  toggleSelectAll() {
    if (this.selectedProducts.size === this.filteredProducts.length) {
      this.selectedProducts.clear();
    } else {
      this.selectedProducts.clear();
      this.filteredProducts.forEach((product) =>
        this.selectedProducts.add(product.productID)
      );
    }
  }

  isSelected(productId: number): boolean {
    return this.selectedProducts.has(productId);
  }

  isAllSelected(): boolean {
    return (
      this.selectedProducts.size === this.filteredProducts.length &&
      this.filteredProducts.length > 0
    );
  }

  isIndeterminate(): boolean {
    return (
      this.selectedProducts.size > 0 &&
      this.selectedProducts.size < this.filteredProducts.length
    );
  }

  onProductClick(product: product) {
    this.router.navigate(['/admin/products/view', product.productID]);
  }

  editProduct(product: product, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/admin/products/', product.productID]);
  }

  confirmDelete(product: product, event: Event) {
    event.stopPropagation();
    this.dialog.open({
      title: 'Delete Product',
      message: `Are you sure you want to delete "${product.productName}"? This action cannot be undone.`,
    });

    this.dialog.confirmed$.subscribe((result) => {
      if (result) {
        this.deleteProduct(product.productID);
      }
    });
  }

  deleteProduct(productID: number) {
    this.productService.delete(productID).subscribe({
      next: () => {
        this.toast.show('Product deleted successfully', 'success');
        this.loadProducts();
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.toast.show('Error deleting product', 'error');
      },
    });
  }

  bulkDelete() {
    const selectedCount = this.selectedProducts.size;
    this.dialog.open({
      title: 'Delete Products',
      message: `Are you sure you want to delete ${selectedCount} product${selectedCount > 1 ? 's' : ''
        }? This action cannot be undone.`,
    });

    this.dialog.confirmed$.subscribe((result) => {
      if (result) {
        const deletePromises = Array.from(this.selectedProducts).map(
          (productId) => this.productService.delete(productId).toPromise()
        );

        Promise.all(deletePromises)
          .then(() => {
            this.toast.show(
              `${selectedCount} products deleted successfully`,
              'success'
            );
            this.selectedProducts.clear();
            this.loadProducts();
          })
          .catch((error) => {
            console.error('Error in bulk delete:', error);
            this.toast.show('Error deleting some products', 'error');
          });
      }
    });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  getStockStatus(stock: number): { text: string; class: string } {
    if (stock === 0)
      return { text: 'Out of Stock', class: 'text-red-600 bg-red-100' };
    if (stock <= 10)
      return { text: 'Low Stock', class: 'text-yellow-600 bg-yellow-100' };
    return { text: 'In Stock', class: 'text-green-600 bg-green-100' };
  }
}
