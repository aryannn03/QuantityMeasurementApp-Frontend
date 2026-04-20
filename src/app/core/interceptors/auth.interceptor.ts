import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { ErrorHandlerService } from '../services/error-handler.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const errorHandler = inject(ErrorHandlerService);

  const token = authService.token;
  let cloned = req;
  if (token && !req.url.includes('api.agify.io')) {
    cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(cloned).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/login')) {
        authService.logout();
        router.navigate(['/auth']);
      } else {
        const message = errorHandler.getFriendlyMessage(error);
        toast.error(message);
      }
      return throwError(() => error);
    })
  );
};