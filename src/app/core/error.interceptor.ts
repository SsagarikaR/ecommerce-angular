import { Injectable, inject } from '@angular/core';
import {
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpInterceptor,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Toast } from '../services/toast/toast';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    private toast = inject(Toast);

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                if (error.status !== 401 && error.status !== 403) {
                    let errorMessage = error.error?.message || 'An unknown error occurred';

                    if (error.status === 0) {
                        errorMessage = 'Network error or backend is down. Check your connection.';
                    } else if (error.status === 404) {
                        errorMessage = 'The requested resource was not found.';
                    }

                    this.toast.show(errorMessage, 'error');
                }

                return throwError(() => error);
            })
        );
    }
}