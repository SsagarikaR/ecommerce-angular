import { Component, inject } from '@angular/core';
import { Product } from '../../services/product/product';
import { category, product } from '../../types/type';
import { ProductCard } from '../product-card/product-card';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { Category } from '../../services/category';
import { RouterLink } from '@angular/router';
import { Preferences } from '../../services/preference/preferences';

@Component({
  selector: 'app-home',
  imports: [ProductCard, CarouselModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
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
      this.products = result;
    });
    this.categoryService.getCategories().subscribe((result: any) => {
      this.categories = result;
    });
    this.preferenceService.getPrefernces().subscribe((result: any) => {
      this.preferences = result;
    });
  }
}
