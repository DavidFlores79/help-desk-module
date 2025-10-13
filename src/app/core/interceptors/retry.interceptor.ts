import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { retry, timer } from 'rxjs';
import { environment } from '../../../environments/environment';

export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  // Only retry GET requests and only on network errors or 5xx errors
  if (req.method !== 'GET') {
    return next(req);
  }

  return next(req).pipe(
    retry({
      count: environment.retryAttempts,
      delay: (error: HttpErrorResponse, retryCount: number) => {
        // Only retry on network errors or 5xx server errors
        if (error.status === 0 || error.status >= 500) {
          const delay = environment.retryDelay * retryCount;
          console.log(`Retrying request (attempt ${retryCount}) after ${delay}ms...`);
          return timer(delay);
        }
        // Don't retry for other errors
        throw error;
      }
    })
  );
};
