import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token;
  const peticion = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      const msg = error.status === 0
        ? 'Sin conexión con el servidor.'
        : `Error ${error.status}: ${error.statusText || 'algo salió mal.'}`;
      console.error('[Interceptor]', msg, error);
      return throwError(() => new Error(msg));
    })
  );
};
