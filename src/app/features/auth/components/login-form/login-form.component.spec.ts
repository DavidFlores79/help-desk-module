import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginFormComponent } from './login-form.component';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';

describe('LoginFormComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let navigate: jasmine.Spy;
  let navigateByUrl: jasmine.Spy;
  let page: HTMLElement;

  /** `url` is the login page address, e.g. with ?returnUrl= added by the auth guard. */
  async function createForm(url = '/'): Promise<LoginFormComponent> {
    authService = jasmine.createSpyObj('AuthService', ['login', 'setPendingVerification']);

    TestBed.configureTestingModule({
      imports: [LoginFormComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: TranslationService, useValue: { instant: (key: string) => key } },
      ],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);
    navigate = spyOn(router, 'navigate').and.resolveTo(true);
    navigateByUrl = spyOn(router, 'navigateByUrl').and.resolveTo(true);

    const fixture = TestBed.createComponent(LoginFormComponent);
    fixture.detectChanges();
    page = fixture.nativeElement as HTMLElement;
    const form = fixture.componentInstance;
    form.loginForm.setValue({ email: 'ana@uady.mx', password: 'secreto1' });
    return form;
  }

  it('goes to the tickets after logging in', async () => {
    const form = await createForm();
    authService.login.and.returnValue(of({}));

    form.onSubmit();

    expect(navigateByUrl).toHaveBeenCalledWith('/tickets');
  });

  it('returns to the page the user asked for (e.g. the QR report form)', async () => {
    const form = await createForm('/?returnUrl=%2Ftickets%2Fnew');
    authService.login.and.returnValue(of({}));

    form.onSubmit();

    expect(navigateByUrl).toHaveBeenCalledWith('/tickets/new');
  });

  it('keeps the return address when a first-time visitor goes to sign up', async () => {
    await createForm('/?returnUrl=%2Ftickets%2Fnew');

    const signUp = page.querySelector('a[href^="/auth/register"]');

    expect(signUp?.getAttribute('href')).toBe('/auth/register?returnUrl=%2Ftickets%2Fnew');
  });

  it('ignores a return address outside the app', async () => {
    const form = await createForm('/?returnUrl=https%3A%2F%2Fevil.com');
    authService.login.and.returnValue(of({}));

    form.onSubmit();

    expect(navigateByUrl).toHaveBeenCalledWith('/tickets');
  });

  it('opens the code screen for an account that has not confirmed its email', async () => {
    const form = await createForm();
    authService.login.and.returnValue(
      throwError(() => ({
        status: 403,
        message: 'Confirma tu correo',
        error: { email_verification_required: true },
      })),
    );

    form.onSubmit();

    expect(authService.setPendingVerification).toHaveBeenCalledWith({
      email: 'ana@uady.mx',
      password: 'secreto1',
      codeSentAt: null,
    });
    expect(navigate).toHaveBeenCalledWith(['/auth/verify-email']);
    expect(form.errorMessage).toBe('');
  });

  it('shows other errors, such as a blocked account', async () => {
    const form = await createForm();
    authService.login.and.returnValue(
      throwError(() => ({ status: 401, message: 'Usuario inactivo o bloqueado.' })),
    );

    form.onSubmit();

    expect(form.errorMessage).toBe('Usuario inactivo o bloqueado.');
    expect(form.isLoading).toBeFalse();
    expect(navigate).not.toHaveBeenCalled();
    expect(navigateByUrl).not.toHaveBeenCalled();
  });
});
