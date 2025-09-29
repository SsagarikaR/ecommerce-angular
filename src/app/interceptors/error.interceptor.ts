import {
    HttpErrorResponse,
    HttpHandlerFn,
    HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Toast } from '../services/toast/toast';

export const errorInterceptor = (
    req: HttpRequest<unknown>,
    next: HttpHandlerFn
) => {
    const toast = inject(Toast);
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status !== 401 && error.status !== 403) {
                let errorMessage = error.error?.message || 'An unknown error occurred';

                if (error.status === 0) {
                    errorMessage =
                        'Network error or backend is down. Check your connection.';
                }
                toast.show(errorMessage, 'error');
            }

            return throwError(() => error);
        })
    );
};
