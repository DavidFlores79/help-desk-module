import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const isProduction = environment.production;
  const isAuthEndpoint = req.url.includes('/auth/') || req.url.includes('/login') || req.url.includes('/register');

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Use backend message if available, otherwise use fallback
      let errorMessage = error.error?.message || 'Ocurrió un error';
      let errorDetails = '';

      // Only log in development
      if (!isProduction) {
        console.group('🔴 [ERROR INTERCEPTOR] HTTP Error Caught');
        console.log('URL:', req.url);
        console.log('Method:', req.method);
        console.log('Status:', error.status);
        console.log('Status Text:', error.statusText);
        console.log('Error Object:', error);
      }

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message || 'Error de conexión';
        errorDetails = 'Error del cliente o de red';
        if (!isProduction) console.error('Client-side error:', error.error);
      } else if (error.status === 0) {
        // Network error or CORS issue
        errorMessage = 'No se puede conectar al servidor';
        errorDetails = 'Verifica tu conexión de red';
        if (!isProduction) {
          console.error('Network error - Status 0:', {
            possibleCauses: [
              'Server is not running',
              'CORS is blocking the request',
              'Network connection lost',
              'Invalid URL'
            ],
            url: req.url
          });
        }
      } else {
        // Server-side error - prefer backend message
        switch (error.status) {
          case 401:
            // Use backend message if available
            if (!error.error?.message) {
              errorMessage = 'Credenciales inválidas';
            }
            // Only logout if NOT an auth endpoint (login/register shouldn't trigger logout)
            if (!isAuthEndpoint && authService.isAuthenticated()) {
              if (!isProduction) console.log('🔒 401 Unauthorized - Logging out user');
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
            if (!isProduction) {
              console.error('🔍 404 Not Found:', {
                url: req.url,
                suggestion: 'Check if the API endpoint exists and the URL is correct'
              });
            }
            break;
          case 422:
            // Validation errors - use backend message
            if (!error.error?.message) {
              errorMessage = 'Error de validación';
            }
            errorDetails = error.error?.errors ? JSON.stringify(error.error.errors) : '';
            if (!isProduction) console.log('📝 422 Validation Error:', error.error);
            break;
          case 500:
            if (!error.error?.message) {
              errorMessage = 'Error interno del servidor. Intenta de nuevo más tarde.';
            }

            // Log detailed backend error information if available (dev only)
            if (!isProduction && error.error) {
              console.error('🔥 500 Server Error - Backend Details:', {
                message: error.error.message,
                exception: error.error.exception,
                file: error.error.file,
                line: error.error.line,
                trace: error.error.trace ? 'Available (check console)' : 'Not available'
              });
            }
            break;
          default:
            if (!error.error?.message) {
              errorMessage = `Error HTTP ${error.status}`;
            }
            errorDetails = `Error inesperado`;
        }
      }

      if (!isProduction) {
        console.log('Error Message:', errorMessage);
        console.log('Error Details:', errorDetails);
        console.log('Response Body:', error.error);
        console.groupEnd();
      }

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        details: errorDetails,
        error: error.error
      }));
    })
  );
};
