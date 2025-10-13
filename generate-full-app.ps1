# Complete Application Generator Script
# This script creates all remaining component files for the Help Desk application

Write-Host "🚀 Generating complete Help Desk application..." -ForegroundColor Cyan
Write-Host ""

# Define all files to create with their content
$files = @{}

#region Auth Components

$files["src/app/features/auth/pages/login-page/login-page.component.ts"] = @'
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from '../../components/login-form/login-form.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, LoginFormComponent],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-heading font-bold text-gray-900 mb-2">Help Desk</h1>
          <p class="text-gray-600">Sign in to your account</p>
        </div>
        <app-login-form></app-login-form>
      </div>
    </div>
  `
})
export class LoginPageComponent {}
'@

$files["src/app/features/auth/components/login-form/login-form.component.ts"] = @'
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="card">
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
          <div class="mb-4 p-3 bg-danger-50 border border-danger-200 rounded-lg">
            <p class="text-sm text-danger-700">{{ errorMessage }}</p>
          </div>
        }

        <button
          type="submit"
          class="w-full btn-primary"
          [disabled]="loginForm.invalid || isLoading"
        >
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>
      </form>
    </div>
  `
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  isLoading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.authService.login(this.loginForm.value as any).subscribe({
        next: () => {
          this.router.navigate(['/tickets']);
        },
        error: (error) => {
          this.errorMessage = error.message || 'Login failed. Please try again.';
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    }
  }
}
'@

#endregion

Write-Host "Creating files..." -ForegroundColor Yellow

$created = 0
$errors = 0

foreach ($file in $files.Keys) {
    try {
        $directory = Split-Path -Path $file -Parent
        if (!(Test-Path $directory)) {
            New-Item -ItemType Directory -Path $directory -Force | Out-Null
        }
        
        Set-Content -Path $file -Value $files[$file] -Encoding UTF8
        Write-Host "✓ Created: $file" -ForegroundColor Green
        $created++
    }
    catch {
        Write-Host "✗ Failed: $file - $($_.Exception.Message)" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "✓ Created: $created files" -ForegroundColor Green
if ($errors -gt 0) {
    Write-Host "✗ Errors: $errors files" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Application structure generated successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Run 'npm install' to ensure all dependencies are installed" -ForegroundColor White
Write-Host "2. Run 'ng serve' to start the development server" -ForegroundColor White
Write-Host "3. Open http://localhost:4200 in your browser" -ForegroundColor White
Write-Host ""
'@
</invoke>