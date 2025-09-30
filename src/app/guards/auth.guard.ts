import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

export const authGuard: CanActivateFn = () => {
  const cookiesService = inject(CookieService);
  const router = inject(Router);
  const token = cookiesService.get('auth_token');
  if (token) {
    return true;
  } else {
    router.navigateByUrl('/login');
    return false;
  }
};
