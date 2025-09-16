import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ProductList } from './components/product-list/product-list';
import { ProductDetail } from './components/product-detail/product-detail';
import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { authGuard } from './core/auth.guard';
import { adminRoutes } from './routes/adminDashboard.route';
import { WishlistPage } from './components/wishlist/wishlist';
import { Checkout } from './components/checkout/checkout';
import { OrderComponent } from './components/order/order';

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
