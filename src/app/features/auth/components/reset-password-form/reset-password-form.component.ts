import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-reset-password-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="card">
      @if (isVerifying) {
        <div class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p class="text-gray-600">{{ 'auth.verifyingToken' | translate }}</p>
        </div>
      } @else if (tokenInvalid) {
        <div class="text-center py-8">
          <div class="mb-4">
            <svg class="h-16 w-16 text-danger-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ 'auth.invalidToken' | translate }}</h3>
          <p class="text-gray-600 mb-6">{{ 'auth.tokenExpiredOrInvalid' | translate }}</p>
          <a routerLink="/auth/forgot-password" class="btn-primary">
            {{ 'auth.requestNewLink' | translate }}
          </a>
        </div>
      } @else if (resetSuccess) {
        <div class="text-center py-8">
          <div class="mb-4">
            <svg class="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">{{ 'auth.passwordResetSuccess' | translate }}</h3>
          <p class="text-gray-600 mb-6">{{ 'auth.canNowLogin' | translate }}</p>
          <a routerLink="/auth/login" class="btn-primary">
            {{ 'auth.goToLogin' | translate }}
          </a>
        </div>
      } @else {
        <form [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()">
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              {{ 'auth.newPassword' | translate }}
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="input-field"
              [class.border-danger-500]="resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched"
              [placeholder]="'auth.passwordPlaceholder' | translate"
            />
            @if (resetPasswordForm.get('password')?.invalid && resetPasswordForm.get('password')?.touched) {
              @if (resetPasswordForm.get('password')?.errors?.['required']) {
                <p class="mt-1 text-sm text-danger-600">{{ 'auth.passwordRequired' | translate }}</p>
              } @else if (resetPasswordForm.get('password')?.errors?.['minlength']) {
                <p class="mt-1 text-sm text-danger-600">{{ 'auth.passwordMinLength' | translate }}</p>
              }
            }
          </div>

          <div class="mb-6">
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-2">
              {{ 'auth.confirmPassword' | translate }}
            </label>
            <input
              id="password_confirmation"
              type="password"
              formControlName="password_confirmation"
              class="input-field"
              [class.border-danger-500]="resetPasswordForm.get('password_confirmation')?.invalid && resetPasswordForm.get('password_confirmation')?.touched"
              [placeholder]="'auth.confirmPasswordPlaceholder' | translate"
            />
            @if (resetPasswordForm.get('password_confirmation')?.touched) {
              @if (resetPasswordForm.get('password_confirmation')?.errors?.['required']) {
                <p class="mt-1 text-sm text-danger-600">{{ 'auth.confirmPasswordRequired' | translate }}</p>
              } @else if (resetPasswordForm.errors?.['passwordMismatch']) {
                <p class="mt-1 text-sm text-danger-600">{{ 'auth.passwordsDoNotMatch' | translate }}</p>
              }
            }
          </div>

          @if (errorMessage) {
            <div class="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
              <p class="text-sm font-semibold text-danger-900 mb-1">{{ 'auth.errorLabel' | translate }}</p>
              <p class="text-sm text-danger-700">{{ errorMessage }}</p>
            </div>
          }

          <button
            type="submit"
            class="w-full btn-primary mb-4"
            [disabled]="resetPasswordForm.invalid || isLoading"
          >
            {{ isLoading ? ('auth.resettingPassword' | translate) : ('auth.resetPassword' | translate) }}
          </button>

          <div class="text-center">
            <a routerLink="/auth/login" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
              {{ 'auth.backToLogin' | translate }}
            </a>
          </div>
        </form>
      }
    </div>
  `
})
export class ResetPasswordFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translationService = inject(TranslationService);

  resetPasswordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirmation: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  isLoading = false;
  isVerifying = true;
  tokenInvalid = false;
  resetSuccess = false;
  errorMessage = '';

  private email = '';
  private token = '';

  ngOnInit(): void {
    // Get email and token from query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';

      if (!this.email || !this.token) {
        this.tokenInvalid = true;
        this.isVerifying = false;
        return;
      }

      this.verifyToken();
    });
  }

  private verifyToken(): void {
    this.authService.verifyResetToken({ email: this.email, token: this.token }).subscribe({
      next: (response) => {
        if (response.success && response.data?.valid) {
          this.isVerifying = false;
        } else {
          this.tokenInvalid = true;
          this.isVerifying = false;
        }
      },
      error: () => {
        this.tokenInvalid = true;
        this.isVerifying = false;
      }
    });
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('password_confirmation');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.resetPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const data = {
        email: this.email,
        token: this.token,
        password: this.resetPasswordForm.value.password!,
        password_confirmation: this.resetPasswordForm.value.password_confirmation!
      };

      this.authService.resetPassword(data).subscribe({
        next: () => {
          this.resetSuccess = true;
          this.isLoading = false;
        },
        error: (error) => {
          if (error.status === 400) {
            this.errorMessage = this.translationService.instant('auth.tokenExpiredOrInvalid');
          } else if (error.status === 422) {
            this.errorMessage = error.error?.errors?.password?.[0] || this.translationService.instant('auth.validationError');
          } else {
            this.errorMessage = error.message || this.translationService.instant('auth.tryAgain');
          }
          this.isLoading = false;
        }
      });
    }
  }
}
