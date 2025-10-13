import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card">
      <!-- API Diagnostic Info -->
      <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
        <p class="font-semibold text-blue-900 mb-1">API Configuration:</p>
        <p class="text-blue-700">Endpoint: {{ apiUrl }}</p>
        <p class="text-blue-700 text-xs mt-1">Check browser console (F12) for detailed request logs</p>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="input-field"
            [class.border-danger-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            placeholder="you@example.com"
          />
          @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
            <p class="mt-1 text-sm text-danger-600">Please enter a valid email</p>
          }
        </div>

        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Password</label>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="input-field"
            [class.border-danger-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            placeholder="••••••••"
          />
          @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
            <p class="mt-1 text-sm text-danger-600">Password is required</p>
          }
        </div>

        @if (errorMessage) {
          <div class="mb-4 p-4 bg-danger-50 border border-danger-200 rounded-lg">
            <p class="text-sm font-semibold text-danger-900 mb-1">Error:</p>
            <p class="text-sm text-danger-700">{{ errorMessage }}</p>
            <p class="text-xs text-danger-600 mt-2">Check the browser console (F12) for detailed logs</p>
          </div>
        }

        <button
          type="submit"
          class="w-full btn-primary"
          [disabled]="loginForm.invalid || isLoading"
        >
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>

        <div class="mt-4 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
          <p class="font-semibold mb-1">Test Credentials (if available):</p>
          <p>Email: test@example.com</p>
          <p>Password: password</p>
        </div>
      </form>
    </div>
  `
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Expose API URL for template
  apiUrl = `${environment.apiUrl}/login`;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMessage = '';

  constructor() {
    // Log component initialization
    console.log('🎯 [LOGIN FORM] Component initialized', {
      apiUrl: this.apiUrl,
      environment: environment
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('📋 [LOGIN FORM] Form submitted', {
        email: this.loginForm.value.email,
        hasPassword: !!this.loginForm.value.password
      });

      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value as any).subscribe({
        next: (response) => {
          console.log('✅ [LOGIN FORM] Login successful, navigating to /tickets', response);
          this.router.navigate(['/tickets']);
        },
        error: (error) => {
          console.error('❌ [LOGIN FORM] Login failed:', error);
          
          // Create a user-friendly error message
          let message = 'Login failed. ';
          if (error.status === 0) {
            message += 'Cannot connect to the server. Please check your network connection and ensure the API server is running.';
          } else if (error.status === 404) {
            message += 'Login endpoint not found. The API URL may be incorrect.';
          } else if (error.details) {
            message += error.details;
          } else {
            message += error.message || 'Please try again.';
          }
          
          this.errorMessage = message;
          this.isLoading = false;
        },
        complete: () => {
          console.log('🏁 [LOGIN FORM] Login request completed');
          this.isLoading = false;
        }
      });
    } else {
      console.warn('⚠️ [LOGIN FORM] Form is invalid', {
        emailErrors: this.loginForm.get('email')?.errors,
        passwordErrors: this.loginForm.get('password')?.errors
      });
    }
  }
}
