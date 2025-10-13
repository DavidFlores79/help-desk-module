import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { environment } from '../../../../../environments/environment';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="card">
      <!-- API Diagnostic Info (Development Only) -->
      @if (!isProduction) {
        <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
          <p class="font-semibold text-blue-900 mb-1">{{ 'auth.apiConfiguration' | translate }}</p>
          <p class="text-blue-700">{{ 'auth.apiEndpoint' | translate }} {{ apiUrl }}</p>
          <p class="text-blue-700 text-xs mt-1">{{ 'auth.checkConsole' | translate }}</p>
        </div>
      }

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">{{ 'auth.email' | translate }}</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="input-field"
            [class.border-danger-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            [placeholder]="'auth.emailPlaceholder' | translate"
          />
          @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
            <p class="mt-1 text-sm text-danger-600">{{ 'auth.emailRequired' | translate }}</p>
          }
        </div>

        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">{{ 'auth.password' | translate }}</label>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="input-field"
            [class.border-danger-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            [placeholder]="'auth.passwordPlaceholder' | translate"
          />
          @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
            <p class="mt-1 text-sm text-danger-600">{{ 'auth.passwordRequired' | translate }}</p>
          }
        </div>

        @if (errorMessage) {
          <div class="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p class="text-sm font-semibold text-danger-900 mb-1">{{ 'auth.errorLabel' | translate }}</p>
            <p class="text-sm text-danger-700">{{ errorMessage }}</p>
            <p class="text-xs text-danger-600 mt-2">{{ 'auth.checkConsoleDetailed' | translate }}</p>
          </div>
        }

        <button
          type="submit"
          class="w-full btn-primary"
          [disabled]="loginForm.invalid || isLoading"
        >
          {{ isLoading ? ('auth.signingIn' | translate) : ('auth.signIn' | translate) }}
        </button>

        <!-- Test Credentials (Development Only) -->
        @if (!isProduction) {
          <div class="mt-4 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
            <p class="font-semibold mb-1">{{ 'auth.testCredentials' | translate }}</p>
            <p>{{ 'auth.email' | translate }}: test@example.com</p>
            <p>{{ 'auth.password' | translate }}: password</p>
          </div>
        }
      </form>
    </div>
  `
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  // Expose API URL and environment for template
  apiUrl = `${environment.apiUrl}/login`;
  isProduction = environment.production;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMessage = '';

  constructor() {
    // Log component initialization (development only)
    if (!this.isProduction) {
      console.log('🎯 [LOGIN FORM] Component initialized', {
        apiUrl: this.apiUrl,
        environment: environment
      });
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      if (!this.isProduction) {
        console.log('📋 [LOGIN FORM] Form submitted', {
          email: this.loginForm.value.email,
          hasPassword: !!this.loginForm.value.password
        });
      }

      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value as any).subscribe({
        next: (response) => {
          if (!this.isProduction) {
            console.log('✅ [LOGIN FORM] Login successful, navigating to /tickets', response);
          }
          this.router.navigate(['/tickets']);
        },
        error: (error) => {
          if (!this.isProduction) {
            console.error('❌ [LOGIN FORM] Login failed:', error);
          }
          
          // Create a user-friendly error message
          let message = this.translationService.instant('auth.loginFailed') + ' ';
          if (error.status === 0) {
            message += this.translationService.instant('auth.cannotConnect');
          } else if (error.status === 404) {
            message += this.translationService.instant('auth.endpointNotFound');
          } else if (error.details) {
            message += error.details;
          } else {
            message += error.message || this.translationService.instant('auth.tryAgain');
          }
          
          this.errorMessage = message;
          this.isLoading = false;
        },
        complete: () => {
          if (!this.isProduction) {
            console.log('🏁 [LOGIN FORM] Login request completed');
          }
          this.isLoading = false;
        }
      });
    } else {
      if (!this.isProduction) {
        console.warn('⚠️ [LOGIN FORM] Form is invalid', {
          emailErrors: this.loginForm.get('email')?.errors,
          passwordErrors: this.loginForm.get('password')?.errors
        });
      }
    }
  }
}
