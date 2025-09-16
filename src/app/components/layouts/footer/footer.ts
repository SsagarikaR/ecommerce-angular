import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../services/category/category';
import { category } from '../../../types/type';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer implements OnInit {
  private categoryService = inject(Category);

  categories: category[] = [];

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe({
      next: (data: any) => {
        this.categories = data;
      },
      error: (err) => {
        console.error('Failed to load categories in footer:', err);
      },
    });
  }
}
