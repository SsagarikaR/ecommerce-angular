import { Component, inject, OnInit } from '@angular/core';
import { Category } from '../../services/category';
import { category } from '../../types/type';
import { CommonModule, LowerCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LowerCasePipe, CommonModule],
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
