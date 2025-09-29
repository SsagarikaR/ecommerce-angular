import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Product } from '../../services/product/product';
import type { category, product } from '../../types/type';
import { ProductCard } from '../product-card/product-card';
import { CarouselModule, type OwlOptions } from 'ngx-owl-carousel-o';
import { Category } from '../../services/category/category';
import { RouterLink } from '@angular/router';
import { Preferences } from '../../services/preference/preferences';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [ProductCard, CarouselModule, RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  heroImage: string = '';
  aboutImage: string = '';
  customOptions: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],

    nav: true,
  };
  productService = inject(Product);
  categoryService = inject(Category);
  preferenceService = inject(Preferences);
  categories!: category[];
  products!: product[];
  preferences!: product[];
  ngOnInit() {
    this.productService.get().subscribe((result: any) => {
      this.products = result || [];
    });
    this.categoryService.getCategories().subscribe((result: any) => {
      this.categories = result || [];
      if (this.categories.length > 0) {
        const randomIndex1 = Math.floor(Math.random() * this.categories.length);
        this.heroImage = this.categories[randomIndex1].categoryThumbnail;
        const randomIndex2 = Math.floor(Math.random() * this.categories.length);
        this.aboutImage = this.categories[randomIndex2].categoryThumbnail;
      }
    });
    this.preferenceService.getPrefernces().subscribe((result: any) => {
      this.preferences = result || [];
    });
  }
}
