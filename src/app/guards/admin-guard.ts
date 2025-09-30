import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Auth } from '../services/auth/auth';

export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isAdmin()) {
    return true;
  } else {
    return router.createUrlTree(['/']);
  }
};
