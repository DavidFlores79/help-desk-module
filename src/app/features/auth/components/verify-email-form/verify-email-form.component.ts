import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, interval, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { VerificationFailure } from '../../../../core/models/auth.model';

/** Seconds between code emails (the API enforces the same limit). */
export const RESEND_COOLDOWN_SECONDS = 60;

/** The code as typed, without spaces or dashes ("123 456" → "123456"). */
export function normalizeCode(code: string): string {
  return code.replace(/\D/g, '');
}

function sixDigitCodeValidator(control: AbstractControl): ValidationErrors | null {
  return normalizeCode(control.value ?? '').length === 6 ? null : { code: true };
}

const FAILURE_MESSAGES: Record<VerificationFailure, string> = {
  invalid_code: 'auth.codeInvalid',
  expired: 'auth.codeExpired',
  too_many_attempts: 'auth.codeTooManyAttempts',
  not_pending: 'auth.emailAlreadyVerified',
};

/** Error shape produced by the app's error interceptor. */
interface ApiError {
  status?: number;
  error?: { errors?: { reason?: VerificationFailure } };
}

/**
 * Confirms a new account with the 6-digit code emailed at sign-up.
 * Right after sign-up or login the credentials are already known; after a
 * page reload the user types their email and password again.
 */
@Component({
  selector: 'app-verify-email-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="card">
      @if (alreadyVerified) {
        <p class="text-sm text-gray-700 mb-4">{{ 'auth.emailAlreadyVerified' | translate }}</p>
        <a routerLink="/auth/login" class="w-full btn-primary inline-block text-center">
          {{ 'auth.goToLogin' | translate }}
        </a>
      } @else {
        <form [formGroup]="form" (ngSubmit)="verify()">
          @if (needsCredentials) {
            <p class="text-sm text-gray-600 mb-4">
              {{ 'auth.verifyNeedsCredentials' | translate }}
            </p>

            <div class="mb-4">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-2">{{
                'auth.email' | translate
              }}</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="input-field"
                [placeholder]="'auth.emailPlaceholder' | translate"
              />
            </div>

            <div class="mb-4">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">{{
                'auth.password' | translate
              }}</label>
              <input
                id="password"
                type="password"
                formControlName="password"
                class="input-field"
                [placeholder]="'auth.passwordPlaceholder' | translate"
              />
            </div>
          } @else {
            <p class="text-sm text-gray-600 mb-4">
              {{ 'auth.codeSentTo' | translate: { email: form.controls.email.value } }}
            </p>
          }

          <div class="mb-6">
            <label for="code" class="block text-sm font-medium text-gray-700 mb-2">{{
              'auth.verificationCode' | translate
            }}</label>
            <input
              id="code"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="7"
              formControlName="code"
              class="input-field text-center text-2xl tracking-[0.5em]"
              placeholder="000000"
            />
            <p class="mt-1 text-xs text-gray-500">{{ 'auth.codeExpiresHint' | translate }}</p>
          </div>

          @if (errorMessageKey) {
            <div class="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <p class="text-sm text-danger-700">{{ errorMessageKey | translate }}</p>
            </div>
          }
          @if (infoMessageKey) {
            <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-sm text-green-700">{{ infoMessageKey | translate }}</p>
            </div>
          }

          <button
            type="submit"
            class="w-full btn-primary mb-4"
            [disabled]="form.invalid || isVerifying || isResending"
          >
            {{ (isVerifying ? 'auth.verifying' : 'auth.verifyEmail') | translate }}
          </button>
        </form>

        <div class="flex items-center justify-between">
          <button
            type="button"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium disabled:text-gray-400"
            [disabled]="resendSecondsLeft > 0 || isResending || isVerifying || !hasCredentials()"
            (click)="resend()"
          >
            @if (resendSecondsLeft > 0) {
              {{ 'auth.resendCodeIn' | translate: { seconds: resendSecondsLeft } }}
            } @else {
              {{ 'auth.resendCode' | translate }}
            }
          </button>
          <a routerLink="/auth/login" class="text-sm text-gray-600 hover:text-gray-700">
            {{ 'auth.backToLogin' | translate }}
          </a>
        </div>
      }
    </div>
  `,
})
export class VerifyEmailFormComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  private destroy$ = new Subject<void>();
  private stopCountdown$ = new Subject<void>();

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    code: ['', sixDigitCodeValidator],
  });

  /** True when we don't have the credentials in memory (e.g. after a page reload). */
  needsCredentials = false;
  alreadyVerified = false;
  isVerifying = false;
  isResending = false;
  resendSecondsLeft = 0;
  // Translation keys (translated in the template so they follow language changes)
  errorMessageKey = '';
  infoMessageKey = '';

  ngOnInit(): void {
    const pending = this.authService.getPendingVerification();

    if (pending) {
      this.form.patchValue({ email: pending.email, password: pending.password });
      if (pending.codeSentAt) {
        const secondsSinceSent = Math.floor((Date.now() - pending.codeSentAt) / 1000);
        this.startCountdown(RESEND_COOLDOWN_SECONDS - secondsSinceSent);
      }
    } else {
      this.needsCredentials = true;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Leaving the screen: the password must not stay in memory
    this.authService.clearPendingVerification();
  }

  hasCredentials(): boolean {
    return this.form.controls.email.valid && this.form.controls.password.valid;
  }

  verify(): void {
    // Never at the same time as a resend: the new code would replace the one being checked
    if (this.form.invalid || this.isVerifying || this.isResending) {
      return;
    }

    const { email, password, code } = this.form.getRawValue();
    this.isVerifying = true;
    this.clearMessages();

    this.authService.verifyEmail({ email, password, code: normalizeCode(code) }).subscribe({
      next: () => {
        // A new user has no tickets yet: take them straight to reporting one
        this.router.navigate(['/tickets/new']);
      },
      error: (error: ApiError) => {
        this.isVerifying = false;
        this.showError(error);

        if (error.status === 400) {
          this.form.controls.code.reset();
        }
      },
    });
  }

  resend(): void {
    if (!this.hasCredentials() || this.isResending || this.isVerifying) {
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.isResending = true;
    this.clearMessages();

    this.authService.resendVerification({ email, password }).subscribe({
      next: () => {
        this.isResending = false;
        this.infoMessageKey = 'auth.codeResent';
        this.form.controls.code.reset();
        this.startCountdown(RESEND_COOLDOWN_SECONDS);
      },
      error: (error: ApiError) => {
        this.isResending = false;

        if (error.status === 429) {
          this.errorMessageKey = 'auth.waitBeforeResend';
          this.startCountdown(RESEND_COOLDOWN_SECONDS);
          return;
        }
        this.showError(error);
      },
    });
  }

  private showError(error: ApiError): void {
    const reason = error.error?.errors?.reason;

    if (error.status === 400 && reason === 'not_pending') {
      this.alreadyVerified = true;
    } else if (error.status === 400 && reason && FAILURE_MESSAGES[reason]) {
      this.errorMessageKey = FAILURE_MESSAGES[reason];
    } else if (error.status === 401) {
      // The credentials in memory or typed don't match: let the user retype them
      this.needsCredentials = true;
      this.errorMessageKey = 'auth.invalidCredentials';
    } else if (error.status === 403) {
      this.errorMessageKey = 'auth.accountInactive';
    } else if (error.status === 429) {
      this.errorMessageKey = 'auth.tooManyTries';
    } else if (error.status === 0) {
      this.errorMessageKey = 'auth.cannotConnect';
    } else {
      this.errorMessageKey = 'auth.tryAgain';
    }
  }

  private clearMessages(): void {
    this.errorMessageKey = '';
    this.infoMessageKey = '';
  }

  private startCountdown(seconds: number): void {
    this.stopCountdown$.next();
    this.resendSecondsLeft = Math.max(0, Math.min(seconds, RESEND_COOLDOWN_SECONDS));

    if (this.resendSecondsLeft === 0) {
      return;
    }

    interval(1000)
      .pipe(takeUntil(this.stopCountdown$), takeUntil(this.destroy$))
      .subscribe(() => {
        this.resendSecondsLeft--;
        if (this.resendSecondsLeft <= 0) {
          this.stopCountdown$.next();
        }
      });
  }
}
