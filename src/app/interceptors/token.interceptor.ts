import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../environment/enviornment.development';

const CLOUDINARY_API_URL = 'api.cloudinary.com/v1_1/';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  const token = cookieService.get('auth_token');

  const apiPrefix = environment.apiPrefix;
  if (req.url.includes(CLOUDINARY_API_URL)) {
    const isAbsolute = /^https?:\/\//i.test(req.url);
    const apiReq = req.clone({
      url: isAbsolute ? req.url : `${apiPrefix}/${req.url}`,
    });
    return next(apiReq);
  }

  const isAbsolute = /^https?:\/\//i.test(req.url);
  const apiReq = req.clone({
    url: isAbsolute ? req.url : `${apiPrefix}/${req.url}`,
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return next(apiReq);
};
