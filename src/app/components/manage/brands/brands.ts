import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Brand } from '../../../services/brand/brand';
import { DialogService } from '../../../services/dialog/dialog';

export interface BrandData {
  brandID: number;
  brandName: string;
  brandThumbnail: string;
}

@Component({
  selector: 'app-brands',
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
  templateUrl: './brands.html',
  styleUrl: './brands.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Brands implements OnInit {
  brands: BrandData[] = [];
  filteredBrands: BrandData[] = [];
  selectedBrands: Set<number> = new Set();
  isLoading = false;
  searchTerm = '';
  Math = Math;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalBrands = 0;
  totalPages = 0;

  // Sorting
  sortBy = 'brandName';
  sortOrder: 'asc' | 'desc' = 'asc';

  private brandService = inject(Brand);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(DialogService);
  private router = inject(Router);

  ngOnInit() {
    this.loadBrands();
  }

  loadBrands() {
    this.isLoading = true;

    this.brandService.getBrands().subscribe({
      next: (result: any) => {
        if (Array.isArray(result)) {
          this.brands = result;
          this.totalBrands = result.length;
        } else if (result.data) {
          this.brands = result.data;
          this.totalBrands = result.total || result.data.length;
        } else {
          this.brands = [];
          this.totalBrands = 0;
        }

        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading brands:', error);
        this.showNotification('Error loading brands', 'error');
        this.isLoading = false;
        this.brands = [];
        this.filteredBrands = [];
      },
    });
  }

  applyFiltersAndSort() {
    let filtered = [...this.brands];

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter((brand) =>
        brand.brandName.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA = a[this.sortBy as keyof BrandData];
      let valueB = b[this.sortBy as keyof BrandData];

      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      if (valueA < valueB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply pagination
    this.totalBrands = filtered.length;
    this.totalPages = Math.ceil(this.totalBrands / this.pageSize);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredBrands = filtered.slice(startIndex, endIndex);
  }

  onSearch(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  clearSearch() {
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFiltersAndSort();
  }

  sortBrands(field: string) {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.applyFiltersAndSort();
  }

  toggleBrandSelection(brandId: number) {
    if (this.selectedBrands.has(brandId)) {
      this.selectedBrands.delete(brandId);
    } else {
      this.selectedBrands.add(brandId);
    }
  }

  toggleSelectAll() {
    if (this.selectedBrands.size === this.filteredBrands.length) {
      this.selectedBrands.clear();
    } else {
      this.selectedBrands.clear();
      this.filteredBrands.forEach((brand) =>
        this.selectedBrands.add(brand.brandID)
      );
    }
  }

  isSelected(brandId: number): boolean {
    return this.selectedBrands.has(brandId);
  }

  isAllSelected(): boolean {
    return (
      this.selectedBrands.size === this.filteredBrands.length &&
      this.filteredBrands.length > 0
    );
  }

  isIndeterminate(): boolean {
    return (
      this.selectedBrands.size > 0 &&
      this.selectedBrands.size < this.filteredBrands.length
    );
  }

  onBrandClick(brand: BrandData) {
    this.router.navigate(['/admin/brands/view', brand.brandID]);
  }

  editBrand(brand: BrandData, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/admin/brands/', brand.brandID]);
  }

  confirmDelete(brand: BrandData, event: Event) {
    event.stopPropagation();
    this.dialog.open({
      title: 'Delete Brand',
      message: `Are you sure you want to delete "${brand.brandName}"? This action cannot be undone.`,
    });

    this.dialog.confirmed$.subscribe((result) => {
      if (result) {
        this.deleteBrand(brand.brandID);
      }
    });
  }

  deleteBrand(brandID: number) {
    this.brandService.deleteBrands(brandID).subscribe({
      next: () => {
        this.showNotification('Brand deleted successfully', 'success');
        this.loadBrands();
      },
      error: (error) => {
        console.error('Error deleting brand:', error);
        this.showNotification('Error deleting brand', 'error');
      },
    });
  }

  bulkDelete() {
    const selectedCount = this.selectedBrands.size;
    this.dialog.open({
      title: 'Delete Brands',
      message: `Are you sure you want to delete ${selectedCount} brand${selectedCount > 1 ? 's' : ''
        }? This action cannot be undone.`,
    });

    this.dialog.confirmed$.subscribe((result) => {
      if (result) {
        const deletePromises = Array.from(this.selectedBrands).map((brandId) =>
          this.brandService.deleteBrands(brandId).toPromise()
        );

        Promise.all(deletePromises)
          .then(() => {
            this.showNotification(
              `${selectedCount} brands deleted successfully`,
              'success'
            );
            this.selectedBrands.clear();
            this.loadBrands();
          })
          .catch((error) => {
            console.error('Error in bulk delete:', error);
            this.showNotification('Error deleting some brands', 'error');
          });
      }
    });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFiltersAndSort();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFiltersAndSort();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFiltersAndSort();
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

  private showNotification(
    message: string,
    type: 'success' | 'error' | 'info' = 'info'
  ) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: [`snackbar-${type}`],
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }
}
