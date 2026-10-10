import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginFormComponent } from './login-form.component';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';

describe('LoginFormComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let navigate: jasmine.Spy;

  function createForm(): LoginFormComponent {
    authService = jasmine.createSpyObj('AuthService', ['login', 'setPendingVerification']);

    TestBed.configureTestingModule({
      imports: [LoginFormComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: TranslationService, useValue: { instant: (key: string) => key } },
      ],
    });
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    const fixture = TestBed.createComponent(LoginFormComponent);
    fixture.detectChanges();
    const form = fixture.componentInstance;
    form.loginForm.setValue({ email: 'ana@uady.mx', password: 'secreto1' });
    return form;
  }

  it('goes to the tickets after logging in', () => {
    const form = createForm();
    authService.login.and.returnValue(of({}));

    form.onSubmit();

    expect(navigate).toHaveBeenCalledWith(['/tickets']);
  });

  it('opens the code screen for an account that has not confirmed its email', () => {
    const form = createForm();
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

  it('shows other errors, such as a blocked account', () => {
    const form = createForm();
    authService.login.and.returnValue(
      throwError(() => ({ status: 401, message: 'Usuario inactivo o bloqueado.' })),
    );

    form.onSubmit();

    expect(form.errorMessage).toBe('Usuario inactivo o bloqueado.');
    expect(form.isLoading).toBeFalse();
    expect(navigate).not.toHaveBeenCalled();
  });
});
