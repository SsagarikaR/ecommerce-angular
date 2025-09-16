import { Routes } from '@angular/router';
import { Categories } from '../components/manage/categories/categories';
import { CategoryForm } from '../components/manage/category-form/category-form';
import { Brands } from '../components/manage/brands/brands';
import { BrandForm } from '../components/manage/brand-form/brand-form';
import { Products } from '../components/manage/products/products';
import { ProductForm } from '../components/manage/product-form/product-form';
import { AdminLayout } from '../components/layouts/admin-layout/admin-layout';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: 'categories',
        component: Categories,
      },
      {
        path: 'add/categories',
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
        path: 'add/brands',
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
        path: 'add/products',
        component: ProductForm,
      },
      {
        path: 'products/:id',
        component: ProductForm,
      },
    ],
  },
];
