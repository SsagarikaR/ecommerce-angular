import { Routes } from '@angular/router';
import { Categories } from '../components/manage/categories/categories';
import { CategoryForm } from '../components/manage/category-form/category-form';
import { Brands } from '../components/manage/brands/brands';
import { BrandForm } from '../components/manage/brand-form/brand-form';
import { Products } from '../components/manage/products/products';
import { ProductForm } from '../components/manage/product-form/product-form';

export const adminRoutes: Routes = [
  {
    path: 'categories',
    component: Categories,
  },
  {
    path: 'categories/add',
    component: CategoryForm,
  },
  {
    path: 'categories/:id',
    component: CategoryForm,
  },
  {
    path: 'brands',
    component: Brands,
  },
  {
    path: 'brands/add',
    component: BrandForm,
  },

  {
    path: 'brands/:id',
    component: BrandForm,
  },
  {
    path: 'products',
    component: Products,
  },
  {
    path: 'products/add',
    component: ProductForm,
  },
  {
    path: 'products/:id',
    component: ProductForm,
  },
];
