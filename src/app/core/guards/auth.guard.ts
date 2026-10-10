import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

const DEFAULT_AFTER_LOGIN = '/tickets';
// The areas behind this guard: the only places a login should return to
const RETURN_AREAS = ['/tickets', '/admin', '/settings'];

/**
 * Where to go after logging in: the requested page when it is inside one of
 * the logged-in areas (e.g. "/tickets/new"), otherwise the ticket list.
 * Anything else (another site, login, password reset...) is ignored.
 */
export function safeReturnUrl(url: string | null | undefined): string {
  const isInsideArea = RETURN_AREAS.some(
    (area) => url === area || url?.startsWith(area + '/') || url?.startsWith(area + '?'),
  );

  return isInsideArea && url ? url : DEFAULT_AFTER_LOGIN;
}

/** Sends logged-out visitors to login, remembering the page they asked for. */
export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};
