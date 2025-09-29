import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const token = cookieService.get('auth_token');

  const apiPrefix = 'http://localhost:5001';

  const isAbsolute = /^https?:\/\//i.test(req.url);
  const apiReq = req.clone({
    url: isAbsolute ? req.url : `${apiPrefix}/${req.url}`,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return next(apiReq);
};
