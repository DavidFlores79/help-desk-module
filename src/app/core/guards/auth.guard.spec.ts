import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router, provideRouter } from '@angular/router';
import { safeReturnUrl } from './auth.guard';
import { routes } from '../../app.routes';
import { AuthService } from '../services/auth.service';

describe('safeReturnUrl', () => {
  it('keeps a page inside the app', () => {
    expect(safeReturnUrl('/tickets/new')).toBe('/tickets/new');
    expect(safeReturnUrl('/tickets/42?tab=responses')).toBe('/tickets/42?tab=responses');
  });

  it('falls back to the tickets for anything else', () => {
    for (const url of [
      null,
      undefined,
      '',
      'tickets',
      'https://evil.com',
      '//evil.com',
      '/\\evil.com',
    ]) {
      expect(safeReturnUrl(url)).withContext(String(url)).toBe('/tickets');
    }
  });

  it('never returns to a login, sign-up or password reset page', () => {
    expect(safeReturnUrl('/auth/login')).toBe('/tickets');
    expect(safeReturnUrl('/auth/register')).toBe('/tickets');
    expect(safeReturnUrl('/reset-password?token=T&email=x@y.com')).toBe('/tickets');
  });

  it('only accepts whole area names', () => {
    expect(safeReturnUrl('/settings')).toBe('/settings');
    expect(safeReturnUrl('/tickets?status=open')).toBe('/tickets?status=open');
    expect(safeReturnUrl('/ticketsevil')).toBe('/tickets');
  });
});

describe('QR code entry (/reportar)', () => {
  function setUp(isAuthenticated: boolean): Router {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(),
        {
          provide: AuthService,
          useValue: { isAuthenticated: () => isAuthenticated, isAdmin: () => false },
        },
      ],
    });
    return TestBed.inject(Router);
  }

  it('sends a logged-out visitor to login, remembering the report form', async () => {
    const router = setUp(false);

    await router.navigateByUrl('/reportar');

    expect(router.url).toBe('/auth/login?returnUrl=%2Ftickets%2Fnew');
  });

  it('takes a logged-in user straight to the report form', async () => {
    const router = setUp(true);

    await router.navigateByUrl('/reportar');

    expect(router.url).toBe('/tickets/new');
  });
});
