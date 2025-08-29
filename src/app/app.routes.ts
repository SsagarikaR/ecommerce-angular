import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ProductList } from './components/product-list/product-list';
import { ProductDetail } from './components/product-detail/product-detail';
import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { authGuard } from './core/auth.guard';
import { adminRoutes } from './routes/adminDashboard.route';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./routes/adminDashboard.route').then((a) => adminRoutes),
  },
  {
    path: 'products',
    component: ProductList,
  },
  {
    path: 'products/:id',
    component: ProductDetail,
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
