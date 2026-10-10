import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService - sign-up and email verification', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  });

  it('signing up does not start a session', () => {
    service
      .register({
        name: 'Ana',
        email: 'ana@uady.mx',
        password: 'secreto1',
        password_confirmation: 'secreto1',
      })
      .subscribe();

    http.expectOne(`${environment.apiUrl}/v1/auth/register`).flush({
      success: true,
      message: '',
      data: { email: 'ana@uady.mx', verification_required: true, code_expires_in_minutes: 15 },
    });

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getToken()).toBeNull();
  });

  it('a verified email starts the session and forgets the pending credentials', () => {
    service.setPendingVerification({
      email: 'ana@uady.mx',
      password: 'secreto1',
      codeSentAt: null,
    });

    service.verifyEmail({ email: 'ana@uady.mx', password: 'secreto1', code: '123456' }).subscribe();

    const request = http.expectOne(`${environment.apiUrl}/v1/auth/verify-email`);
    expect(request.request.body).toEqual({
      email: 'ana@uady.mx',
      password: 'secreto1',
      code: '123456',
    });
    request.flush({
      success: true,
      message: '',
      data: {
        user: {
          id: 7,
          name: 'Ana',
          email: 'ana@uady.mx',
          my_profile: { id: 3, name: 'Usuario', is_admin: false },
        },
        token: 'jwt-token',
        token_type: 'Bearer',
        expires_at: 0,
      },
    });

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.getToken()).toBe('jwt-token');
    expect(service.getCurrentUser()?.role).toBe('user');
    expect(service.getPendingVerification()).toBeNull();
  });

  it('a rejected code keeps the pending credentials for another try', () => {
    service.setPendingVerification({
      email: 'ana@uady.mx',
      password: 'secreto1',
      codeSentAt: null,
    });

    service
      .verifyEmail({ email: 'ana@uady.mx', password: 'secreto1', code: '000000' })
      .subscribe({ error: () => {} });
    http
      .expectOne(`${environment.apiUrl}/v1/auth/verify-email`)
      .flush(
        { success: false, errors: { reason: 'invalid_code' } },
        { status: 400, statusText: 'Bad Request' },
      );

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getPendingVerification()?.email).toBe('ana@uady.mx');
  });

  it('logging out forgets the pending credentials', () => {
    service.setPendingVerification({
      email: 'ana@uady.mx',
      password: 'secreto1',
      codeSentAt: null,
    });

    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    service.logout();

    expect(service.getPendingVerification()).toBeNull();
  });
});
