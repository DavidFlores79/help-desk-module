import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';
      let errorDetails = '';

      console.group('🔴 [ERROR INTERCEPTOR] HTTP Error Caught');
      console.log('URL:', req.url);
      console.log('Method:', req.method);
      console.log('Status:', error.status);
      console.log('Status Text:', error.statusText);
      console.log('Error Object:', error);

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Client Error: ${error.error.message}`;
        errorDetails = 'This is a client-side or network error';
        console.error('Client-side error:', error.error);
      } else if (error.status === 0) {
        // Network error or CORS issue
        errorMessage = 'Cannot connect to server';
        errorDetails = `Network error or CORS issue. Check if the API at ${req.url} is accessible.`;
        console.error('Network error - Status 0:', {
          possibleCauses: [
            'Server is not running',
            'CORS is blocking the request',
            'Network connection lost',
            'Invalid URL'
          ],
          url: req.url
        });
      } else {
        // Server-side error
        switch (error.status) {
          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            errorDetails = 'Authentication failed or session expired';
            console.log('🔒 401 Unauthorized - Logging out user');
            authService.logout();
            router.navigate(['/auth/login']);
            break;
          case 403:
            errorMessage = 'Forbidden. You do not have permission to access this resource.';
            errorDetails = 'Insufficient permissions';
            break;
          case 404:
            errorMessage = 'Resource not found.';
            errorDetails = `The endpoint ${req.url} does not exist on the server`;
            console.error('🔍 404 Not Found:', {
              url: req.url,
              suggestion: 'Check if the API endpoint exists and the URL is correct'
            });
            break;
          case 422:
            errorMessage = error.error?.message || 'Validation error';
            errorDetails = error.error?.errors ? JSON.stringify(error.error.errors) : 'Form validation failed';
            console.log('📝 422 Validation Error:', error.error);
            break;
          case 500:
            errorMessage = 'Internal server error. Please try again later.';
            errorDetails = 'Server encountered an error';
            
            // Log detailed backend error information if available
            if (error.error) {
              console.error('🔥 500 Server Error - Backend Details:', {
                message: error.error.message,
                exception: error.error.exception,
                file: error.error.file,
                line: error.error.line,
                trace: error.error.trace ? 'Available (check console)' : 'Not available'
              });
              
              // If Laravel/Symfony error, provide more context
              if (error.error.message && error.error.exception) {
                errorMessage = 'Server error: ' + (error.error.exception || 'Internal Error');
                errorDetails = error.error.message || 'Server encountered an unexpected error';
              }
            }
            break;
          default:
            errorMessage = error.error?.message || `HTTP ${error.status}: ${error.message}`;
            errorDetails = `Unexpected error with status ${error.status}`;
        }
      }

      console.log('Error Message:', errorMessage);
      console.log('Error Details:', errorDetails);
      console.log('Response Body:', error.error);
      console.groupEnd();

      return throwError(() => ({
        status: error.status,
        message: errorMessage,
        details: errorDetails,
        error: error.error
      }));
    })
  );
};
