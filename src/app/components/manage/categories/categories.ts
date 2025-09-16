import { Component, inject, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category } from '../../../services/category/category';
import { DialogService } from '../../../services/dialog';
import { CategroyData } from '../../../types/type';

@Component({
  selector: 'app-categories',
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
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
  categories: CategroyData[] = [];
  filteredCategories: CategroyData[] = [];
  selectedCategories: Set<number> = new Set();
  isLoading = false;
  searchTerm = '';
  Math = Math;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCategories = 0;
  totalPages = 0;

  // Sorting
  sortBy = 'categoryName';
  sortOrder: 'asc' | 'desc' = 'asc';

  private categoryService = inject(Category);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(DialogService);
  private router = inject(Router);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;

    this.categoryService.getCategories().subscribe({
      next: (result: any) => {
        console.log('Categories loaded:', result);

        if (Array.isArray(result)) {
          this.categories = result;
          this.totalCategories = result.length;
        } else if (result.data) {
          this.categories = result.data;
          this.totalCategories = result.total || result.data.length;
        } else {
          this.categories = [];
          this.totalCategories = 0;
        }

        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showNotification('Error loading categories', 'error');
        this.isLoading = false;
        this.categories = [];
        this.filteredCategories = [];
      },
    });
  }

  applyFiltersAndSort() {
    let filtered = [...this.categories];

    // Apply search filter
    if (this.searchTerm) {
      filtered = filtered.filter((category) =>
        category.categoryName
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let valueA = a[this.sortBy as keyof CategroyData];
      let valueB = b[this.sortBy as keyof CategroyData];

      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      if (valueA < valueB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Apply pagination
    this.totalCategories = filtered.length;
    this.totalPages = Math.ceil(this.totalCategories / this.pageSize);

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredCategories = filtered.slice(startIndex, endIndex);
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

  sortCategories(field: string) {
    if (this.sortBy === field) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = field;
      this.sortOrder = 'asc';
    }
    this.applyFiltersAndSort();
  }

  toggleCategorySelection(categoryId: number) {
    if (this.selectedCategories.has(categoryId)) {
      this.selectedCategories.delete(categoryId);
    } else {
      this.selectedCategories.add(categoryId);
    }
  }

  toggleSelectAll() {
    if (this.selectedCategories.size === this.filteredCategories.length) {
      this.selectedCategories.clear();
    } else {
      this.selectedCategories.clear();
      this.filteredCategories.forEach((category) =>
        this.selectedCategories.add(category.categoryID)
      );
    }
  }

  isSelected(categoryId: number): boolean {
    return this.selectedCategories.has(categoryId);
  }

  isAllSelected(): boolean {
    return (
      this.selectedCategories.size === this.filteredCategories.length &&
      this.filteredCategories.length > 0
    );
  }

  isIndeterminate(): boolean {
    return (
      this.selectedCategories.size > 0 &&
      this.selectedCategories.size < this.filteredCategories.length
    );
  }

  onCategoryClick(category: CategroyData) {
    this.router.navigate(['/admin/categories/view', category.categoryID]);
  }

  editCategory(category: CategroyData, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/admin/categories/', category.categoryID]);
  }

  confirmDelete(category: CategroyData, event: Event) {
    event.stopPropagation();
    this.dialog.open({
      title: 'Delete Category',
      message: `Are you sure you want to delete "${category.categoryName}"? This action cannot be undone.`,
    });

    this.dialog.confirmed$.subscribe((result) => {
      if (result) {
        this.deleteCategory(category.categoryID);
      }
    });
  }

  deleteCategory(categoryID: number) {
    // Assuming you have a delete method in your category service
    // You'll need to implement this method in your Category service
    this.categoryService.deleteCategory(categoryID).subscribe({
      next: () => {
        this.showNotification('Category deleted successfully', 'success');
        this.loadCategories();
      },
      error: (error) => {
        console.error('Error deleting category:', error);
        this.showNotification('Error deleting category', 'error');
      },
    });
  }

  bulkDelete() {
    const selectedCount = this.selectedCategories.size;
    this.dialog.open({
      title: 'Delete Categories',
      message: `Are you sure you want to delete ${selectedCount} categor${
        selectedCount > 1 ? 'ies' : 'y'
      }? This action cannot be undone.`,
    });

    this.dialog.confirmed$.subscribe((result) => {
      if (result) {
        const deletePromises = Array.from(this.selectedCategories).map(
          (categoryId) =>
            this.categoryService.deleteCategory(categoryId).toPromise()
        );

        Promise.all(deletePromises)
          .then(() => {
            this.showNotification(
              `${selectedCount} categories deleted successfully`,
              'success'
            );
            this.selectedCategories.clear();
            this.loadCategories();
          })
          .catch((error) => {
            console.error('Error in bulk delete:', error);
            this.showNotification('Error deleting some categories', 'error');
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
