import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { VerifyEmailFormComponent, normalizeCode } from './verify-email-form.component';
import { AuthService, PendingVerification } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';

describe('VerifyEmailFormComponent', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let navigate: jasmine.Spy;

  const justSignedUp: PendingVerification = {
    email: 'ana@uady.mx',
    password: 'secreto1',
    codeSentAt: Date.now(),
  };

  /** `pending` is what sign-up or login left in memory (null after a page reload). */
  function setUp(pending: PendingVerification | null): void {
    authService = jasmine.createSpyObj('AuthService', [
      'getPendingVerification',
      'verifyEmail',
      'resendVerification',
      'clearPendingVerification',
    ]);
    authService.getPendingVerification.and.returnValue(
      pending && { ...pending, codeSentAt: pending.codeSentAt && Date.now() },
    );

    TestBed.configureTestingModule({
      imports: [VerifyEmailFormComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: TranslationService, useValue: { instant: (key: string) => key } },
      ],
    });
  }

  function createForm(): VerifyEmailFormComponent {
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    const fixture = TestBed.createComponent(VerifyEmailFormComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('uses the credentials from sign-up, so only the code is asked', () => {
    setUp(justSignedUp);
    const form = createForm();

    expect(form.needsCredentials).toBeFalse();
    expect(form.form.controls.email.value).toBe('ana@uady.mx');
    expect(form.form.controls.password.value).toBe('secreto1');
  });

  it('asks for email and password after a reload', () => {
    setUp(null);
    const form = createForm();

    expect(form.needsCredentials).toBeTrue();
    expect(form.form.controls.email.value).toBe('');
    expect(form.form.controls.password.value).toBe('');
  });

  it('forgets the password when leaving the screen', () => {
    setUp(justSignedUp);
    const fixture = TestBed.createComponent(VerifyEmailFormComponent);
    fixture.detectChanges();

    fixture.destroy();

    expect(authService.clearPendingVerification).toHaveBeenCalled();
  });

  it('asks to wait when code checks come too fast', () => {
    setUp(justSignedUp);
    const form = createForm();
    authService.verifyEmail.and.returnValue(throwError(() => ({ status: 429 })));
    form.form.controls.code.setValue('123456');

    form.verify();

    expect(form.errorMessageKey).toBe('auth.tooManyTries');
  });

  it('a regular user goes straight to reporting their first problem', () => {
    setUp(justSignedUp);
    const form = createForm();
    authService.verifyEmail.and.returnValue(of({ success: true, message: '', data: {} as never }));
    form.form.controls.code.setValue('123 456');

    form.verify();

    expect(authService.verifyEmail).toHaveBeenCalledWith({
      email: 'ana@uady.mx',
      password: 'secreto1',
      code: '123456',
    });
    expect(navigate).toHaveBeenCalledWith(['/tickets/new']);
  });

  it('explains each rejected code and clears the input', () => {
    setUp(justSignedUp);
    const form = createForm();
    const reasons = {
      invalid_code: 'auth.codeInvalid',
      expired: 'auth.codeExpired',
      too_many_attempts: 'auth.codeTooManyAttempts',
    };

    for (const [reason, key] of Object.entries(reasons)) {
      authService.verifyEmail.and.returnValue(
        throwError(() => ({ status: 400, error: { errors: { reason } } })),
      );
      form.form.controls.code.setValue('123456');

      form.verify();

      expect(form.errorMessageKey).withContext(reason).toBe(key);
      expect(form.form.controls.code.value).toBe('');
      expect(form.isVerifying).toBeFalse();
    }
  });

  it('sends an already verified user to log in', () => {
    setUp(justSignedUp);
    const form = createForm();
    authService.verifyEmail.and.returnValue(
      throwError(() => ({ status: 400, error: { errors: { reason: 'not_pending' } } })),
    );
    form.form.controls.code.setValue('123456');

    form.verify();

    expect(form.alreadyVerified).toBeTrue();
  });

  it('asks for the credentials again when they are rejected', () => {
    setUp(justSignedUp);
    const form = createForm();
    authService.verifyEmail.and.returnValue(throwError(() => ({ status: 401 })));
    form.form.controls.code.setValue('123456');

    form.verify();

    expect(form.needsCredentials).toBeTrue();
    expect(form.errorMessageKey).toBe('auth.invalidCredentials');
  });

  it('waits a minute after sign-up before offering a new code', fakeAsync(() => {
    setUp(justSignedUp);
    const form = createForm();

    expect(form.resendSecondsLeft).toBe(60);
    tick(60_000);
    expect(form.resendSecondsLeft).toBe(0);
  }));

  it('offers a new code right away when coming from login', () => {
    setUp({ ...justSignedUp, codeSentAt: null });
    const form = createForm();

    expect(form.resendSecondsLeft).toBe(0);
  });

  it('sends a new code and restarts the wait', fakeAsync(() => {
    setUp({ ...justSignedUp, codeSentAt: null });
    const form = createForm();
    authService.resendVerification.and.returnValue(
      of({ success: true, message: '', data: { code_expires_in_minutes: 15 } }),
    );

    form.resend();

    expect(authService.resendVerification).toHaveBeenCalledWith({
      email: 'ana@uady.mx',
      password: 'secreto1',
    });
    expect(form.infoMessageKey).toBe('auth.codeResent');
    expect(form.resendSecondsLeft).toBe(60);
    tick(60_000);
    expect(form.resendSecondsLeft).toBe(0);
  }));

  it('explains a resend that came too soon and waits', fakeAsync(() => {
    setUp({ ...justSignedUp, codeSentAt: null });
    const form = createForm();
    authService.resendVerification.and.returnValue(throwError(() => ({ status: 429 })));

    form.resend();

    expect(form.errorMessageKey).toBe('auth.waitBeforeResend');
    expect(form.resendSecondsLeft).toBe(60);
    tick(60_000);
  }));

  it('does not check a code and send a new one at the same time', () => {
    setUp({ ...justSignedUp, codeSentAt: null });
    const form = createForm();
    form.form.controls.code.setValue('123456');
    form.isVerifying = true;

    form.resend();

    expect(authService.resendVerification).not.toHaveBeenCalled();

    form.isVerifying = false;
    form.isResending = true;
    form.verify();

    expect(authService.verifyEmail).not.toHaveBeenCalled();
  });

  it('reads the code without spaces or dashes', () => {
    expect(normalizeCode(' 123-456 ')).toBe('123456');
  });
});
