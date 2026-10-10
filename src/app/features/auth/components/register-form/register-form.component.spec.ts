import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { RegisterFormComponent } from './register-form.component';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { ApiResponse } from '../../../../core/models/api-response.model';
import { RegistrationOptions } from '../../../../core/models/registration-settings.model';

describe('RegisterFormComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let navigate: jasmine.Spy;

  const uadyOnly = of({
    success: true,
    message: '',
    data: { allowed_domains: ['uady.mx'], allow_public_emails: false },
  });

  function createForm(
    options: Observable<ApiResponse<RegistrationOptions>> = uadyOnly,
  ): RegisterFormComponent {
    authService = jasmine.createSpyObj('AuthService', [
      'getRegistrationOptions',
      'register',
      'setPendingVerification',
    ]);
    authService.getRegistrationOptions.and.returnValue(options);

    TestBed.configureTestingModule({
      imports: [RegisterFormComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: TranslationService, useValue: { instant: (key: string) => key } },
      ],
    });
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    const fixture = TestBed.createComponent(RegisterFormComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  function fillIn(form: RegisterFormComponent, email: string): void {
    form.registerForm.setValue({
      name: 'Ana Pérez',
      email,
      phone: '',
      department: '',
      password: 'secreto1',
      password_confirmation: 'secreto1',
    });
  }

  it('tells people which emails they can use', () => {
    const form = createForm();

    expect(form.allowedDomainsHint).toBe('@uady.mx');
  });

  it('rejects an email the sign-up rules do not allow, before submitting', () => {
    const form = createForm();

    fillIn(form, 'ana@gmail.com');
    expect(form.registerForm.controls.email.hasError('domainNotAllowed')).toBeTrue();

    fillIn(form, 'ana@alumnos.uady.mx');
    expect(form.registerForm.controls.email.valid).toBeTrue();
  });

  it('shows no hint and accepts any email when public emails are allowed', () => {
    const form = createForm(
      of({ success: true, message: '', data: { allowed_domains: [], allow_public_emails: true } }),
    );

    fillIn(form, 'ana@gmail.com');

    expect(form.allowedDomainsHint).toBe('');
    expect(form.registerForm.controls.email.valid).toBeTrue();
  });

  it('says sign-up is closed when no email is allowed', () => {
    const form = createForm(
      of({ success: true, message: '', data: { allowed_domains: [], allow_public_emails: false } }),
    );

    expect(form.signUpClosed).toBeTrue();
    expect(form.allowedDomainsHint).toBe('');
  });

  it('leaves the check to the API when the rules cannot be loaded', () => {
    const form = createForm(throwError(() => ({ status: 500 })));

    fillIn(form, 'ana@gmail.com');

    expect(form.registerForm.controls.email.valid).toBeTrue();
  });

  it('after signing up, goes to the code screen remembering the credentials', () => {
    const form = createForm();
    authService.register.and.returnValue(
      of({
        success: true,
        message: '',
        data: { email: 'ana@uady.mx', verification_required: true, code_expires_in_minutes: 15 },
      }),
    );
    fillIn(form, 'ana@uady.mx');

    form.onSubmit();

    expect(authService.setPendingVerification).toHaveBeenCalledWith(
      jasmine.objectContaining({ email: 'ana@uady.mx', password: 'secreto1' }),
    );
    expect(navigate).toHaveBeenCalledWith(['/auth/verify-email']);
  });

  it('signing up again within a minute goes to enter the code already sent', () => {
    const form = createForm();
    authService.register.and.returnValue(throwError(() => ({ status: 429 })));
    fillIn(form, 'ana@uady.mx');

    form.onSubmit();

    expect(authService.setPendingVerification).toHaveBeenCalledWith(
      jasmine.objectContaining({ email: 'ana@uady.mx', password: 'secreto1' }),
    );
    expect(navigate).toHaveBeenCalledWith(['/auth/verify-email']);
  });

  it('shows the API reason when the email is rejected', () => {
    const form = createForm();
    authService.register.and.returnValue(
      throwError(() => ({
        status: 422,
        error: { errors: { email: ['The email has already been taken.'] } },
      })),
    );
    fillIn(form, 'ana@uady.mx');

    form.onSubmit();

    expect(form.errorMessage).toBe('The email has already been taken.');
    expect(form.isLoading).toBeFalse();
    expect(navigate).not.toHaveBeenCalled();
  });
});
