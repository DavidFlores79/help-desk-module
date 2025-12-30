import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const logger = inject(LoggerService);
  const isAuthEndpoint = req.url.includes('/auth/') || req.url.includes('/login') || req.url.includes('/register');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = error.error?.message || 'Ocurrió un error';
      let errorDetails = '';

      logger.group('[ERROR INTERCEPTOR] HTTP Error');
      logger.debug('URL:', req.url);
      logger.debug('Method:', req.method);
      logger.debug('Status:', error.status);
      logger.debug('Status Text:', error.statusText);

      if (error.error instanceof ErrorEvent) {
        errorMessage = error.error.message || 'Error de conexión';
        errorDetails = 'Error del cliente o de red';
        logger.error('Client-side error:', error.error);
      } else if (error.status === 0) {
        errorMessage = 'No se puede conectar al servidor';
        errorDetails = 'Verifica tu conexión de red';
        logger.error('Network error - Status 0:', { url: req.url });
      } else {
        switch (error.status) {
          case 401:
            if (!error.error?.message) {
              errorMessage = 'Credenciales inválidas';
            }
            if (!isAuthEndpoint && authService.isAuthenticated()) {
              logger.info('401 Unauthorized - Logging out user');
              authService.logout();
              router.navigate(['/auth/login']);
            }
            break;
          case 403:
            if (!error.error?.message) {
              errorMessage = 'No tienes permiso para realizar esta acción';
            }
            errorDetails = 'Permisos insuficientes';
            break;
          case 404:
            if (!error.error?.message) {
              errorMessage = 'Recurso no encontrado';
            }
            logger.warn('404 Not Found:', req.url);
            break;
          case 422:
            if (!error.error?.message) {
              errorMessage = 'Error de validación';
            }
            errorDetails = error.error?.errors ? JSON.stringify(error.error.errors) : '';
            logger.debug('422 Validation Error:', error.error);
            break;
          case 500:
            if (!error.error?.message) {
              errorMessage = 'Error interno del servidor. Intenta de nuevo más tarde.';
            }
            logger.error('500 Server Error:', {
              message: error.error?.message,
              exception: error.error?.exception
            });
            break;
          default:
            if (!error.error?.message) {
              errorMessage = `Error HTTP ${error.status}`;
            }
            errorDetails = 'Error inesperado';
        }
      }

      logger.debug('Error Message:', errorMessage);
      logger.debug('Error Details:', errorDetails);
      logger.groupEnd();

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        details: errorDetails,
        error: error.error
      }));
    })
  );
};
