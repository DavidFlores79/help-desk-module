import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-forgot-password-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="card">
      <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            {{ 'auth.email' | translate }}
          </label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="input-field"
            [class.border-danger-500]="forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched"
            [placeholder]="'auth.emailPlaceholder' | translate"
          />
          @if (forgotPasswordForm.get('email')?.invalid && forgotPasswordForm.get('email')?.touched) {
            <p class="mt-1 text-sm text-danger-600">{{ 'auth.emailRequired' | translate }}</p>
          }
        </div>

        @if (errorMessage) {
          <div class="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p class="text-sm font-semibold text-danger-900 mb-1">{{ 'auth.errorLabel' | translate }}</p>
            <p class="text-sm text-danger-700">{{ errorMessage }}</p>
          </div>
        }

        @if (successMessage) {
          <div class="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-sm font-semibold text-green-900 mb-1">{{ 'app.success' | translate }}</p>
            <p class="text-sm text-green-700">{{ successMessage }}</p>
          </div>
        }

        <button
          type="submit"
          class="w-full btn-primary mb-4"
          [disabled]="forgotPasswordForm.invalid || isLoading"
        >
          {{ isLoading ? ('auth.sendingResetLink' | translate) : ('auth.sendResetLink' | translate) }}
        </button>

        <div class="text-center">
          <a routerLink="/auth/login" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
            {{ 'auth.backToLogin' | translate }}
          </a>
        </div>
      </form>
    </div>
  `
})
export class ForgotPasswordFormComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit(): void {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const email = this.forgotPasswordForm.value.email!;

      this.authService.forgotPassword({ email }).subscribe({
        next: (response) => {
          this.successMessage = response.message || this.translationService.instant('auth.resetLinkSent');
          this.isLoading = false;
        },
        error: (error) => {
          if (error.status === 404) {
            this.errorMessage = this.translationService.instant('auth.emailNotFound');
          } else if (error.status === 403) {
            this.errorMessage = this.translationService.instant('auth.accountInactive');
          } else if (error.status === 0) {
            this.errorMessage = this.translationService.instant('auth.cannotConnect');
          } else {
            this.errorMessage = error.message || this.translationService.instant('auth.tryAgain');
          }
          this.isLoading = false;
        }
      });
    }
  }
}
