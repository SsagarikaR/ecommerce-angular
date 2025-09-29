import { Routes } from '@angular/router';
import { Home } from './page/home/home';
import { ProductList } from './page/product-list/product-list';
import { ProductDetail } from './page/product-detail/product-detail';
import { Register } from './page/register/register';
import { Login } from './page/login/login';
import { authGuard } from './guards/auth.guard';
import { adminRoutes } from './routes/adminDashboard.route';
import { WishlistPage } from './page/wishlist/wishlist';
import { Checkout } from './page/checkout/checkout';
import { OrderComponent } from './page/order/order';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    canActivate: [authGuard],
    data: { breadcrumb: 'Home' },
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./routes/adminDashboard.route').then((a) => adminRoutes),
    data: { hideLayout: true },
  },
  {
    path: 'products',
    data: { breadcrumb: 'Products' },
    children: [
      {
        path: '',
        component: ProductList,
      },
      {
        path: ':id',
        component: ProductDetail,
        data: { breadcrumb: 'Detail' },
      },
    ],
  },
  {
    path: 'wishlist',
    component: WishlistPage,
  },
  {
    path: 'orders',
    component: OrderComponent,
  },
  {
    path: 'checkout',
    component: Checkout,
    data: { hideLayout: true },
  },
  {
    path: 'register',
    component: Register,
    data: { hideLayout: true },
  },
  {
    path: 'login',
    component: Login,
    data: { hideLayout: true },
  },
];
