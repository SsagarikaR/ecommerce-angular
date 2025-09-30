import { Routes } from '@angular/router';
import { Categories } from '../page/admin-dashboard/categories/categories';
import { CategoryForm } from '../page/admin-dashboard/category-form/category-form';
import { Brands } from '../page/admin-dashboard/brands/brands';
import { BrandForm } from '../page/admin-dashboard/brand-form/brand-form';
import { Products } from '../page/admin-dashboard/products/products';
import { ProductForm } from '../page/admin-dashboard/product-form/product-form';
import { AdminLayout } from '../components/layouts/admin-layout/admin-layout';
import { adminGuard } from '../guards/admin-guard';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayout,
    canActivate: [adminGuard],
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
