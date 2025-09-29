import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Product } from '../../services/product/product';
import type { category, preferences, product } from '../../types/type';
import { ProductCard } from '../../components/product-card/product-card';
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
  preferences!: preferences[];
  ngOnInit() {
    this.productService.get().subscribe((result: product[]) => {
      this.products = result || [];
      if (this.products.length > 0) {
        const randomIndex1 = Math.floor(Math.random() * this.products.length);
        this.heroImage = this.products[randomIndex1].productThumbnail;
        const randomIndex2 = Math.floor(Math.random() * this.products.length);
        this.aboutImage = this.products[randomIndex2].productThumbnail;
      }
    });
    this.categoryService.getCategories().subscribe((result: category[]) => {
      this.categories = result || [];

    });
    this.preferenceService.getPrefernces().subscribe((result: preferences[]) => {
      this.preferences = result || [];
    });
  }
}
