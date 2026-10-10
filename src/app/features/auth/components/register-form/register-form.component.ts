import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import {
  RegistrationOptions,
  isEmailAllowed
} from '../../../../core/models/registration-settings.model';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  template: `
    <div class="card">
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
            {{ 'auth.name' | translate }}
          </label>
          <input
            id="name"
            type="text"
            formControlName="name"
            class="input-field"
            [class.border-danger-500]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched"
            [placeholder]="'auth.namePlaceholder' | translate"
          />
          @if (registerForm.get('name')?.invalid && registerForm.get('name')?.touched) {
            <p class="mt-1 text-sm text-danger-600">{{ 'auth.nameRequired' | translate }}</p>
          }
        </div>

        <div class="mb-4">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            {{ 'auth.email' | translate }}
          </label>
          <input
            id="email"
            type="email"
            formControlName="email"
            class="input-field"
            [class.border-danger-500]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            [placeholder]="'auth.emailPlaceholder' | translate"
          />
          @if (registerForm.get('email')?.touched && registerForm.get('email')?.hasError('domainNotAllowed')) {
            <p class="mt-1 text-sm text-danger-600">{{ 'auth.emailDomainNotAllowed' | translate }}</p>
          } @else if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
            <p class="mt-1 text-sm text-danger-600">{{ 'auth.emailRequired' | translate }}</p>
          }
          @if (signUpClosed) {
            <p class="mt-1 text-sm text-amber-600">{{ 'auth.signUpClosed' | translate }}</p>
          } @else if (allowedDomainsHint) {
            <p class="mt-1 text-xs text-gray-500">
              {{ 'auth.allowedDomainsHint' | translate: { domains: allowedDomainsHint } }}
            </p>
          }
        </div>

        <div class="mb-4">
          <label for="phone" class="block text-sm font-medium text-gray-700 mb-2">
            {{ 'auth.phone' | translate }}
            <span class="text-gray-400 font-normal">({{ 'app.optional' | translate }})</span>
          </label>
          <input
            id="phone"
            type="tel"
            formControlName="phone"
            class="input-field"
            [placeholder]="'auth.phonePlaceholder' | translate"
          />
        </div>

        <div class="mb-4">
          <label for="department" class="block text-sm font-medium text-gray-700 mb-2">
            {{ 'auth.department' | translate }}
            <span class="text-gray-400 font-normal">({{ 'app.optional' | translate }})</span>
          </label>
          <input
            id="department"
            type="text"
            formControlName="department"
            class="input-field"
            [placeholder]="'auth.departmentPlaceholder' | translate"
          />
        </div>

        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            {{ 'auth.password' | translate }}
          </label>
          <input
            id="password"
            type="password"
            formControlName="password"
            class="input-field"
            [class.border-danger-500]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
            [placeholder]="'auth.passwordPlaceholder' | translate"
          />
          @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
            @if (registerForm.get('password')?.errors?.['required']) {
              <p class="mt-1 text-sm text-danger-600">{{ 'auth.passwordRequired' | translate }}</p>
            } @else if (registerForm.get('password')?.errors?.['minlength']) {
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
            [class.border-danger-500]="registerForm.get('password_confirmation')?.invalid && registerForm.get('password_confirmation')?.touched"
            [placeholder]="'auth.confirmPasswordPlaceholder' | translate"
          />
          @if (registerForm.get('password_confirmation')?.touched) {
            @if (registerForm.get('password_confirmation')?.errors?.['required']) {
              <p class="mt-1 text-sm text-danger-600">{{ 'auth.confirmPasswordRequired' | translate }}</p>
            } @else if (registerForm.errors?.['passwordMismatch']) {
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
          [disabled]="registerForm.invalid || isLoading"
        >
          {{ isLoading ? ('auth.registering' | translate) : ('auth.register' | translate) }}
        </button>

        <div class="text-center">
          <span class="text-sm text-gray-600">{{ 'auth.alreadyHaveAccount' | translate }}</span>
          <a routerLink="/auth/login" queryParamsHandling="preserve" class="text-sm text-primary-600 hover:text-primary-700 font-medium ml-1">
            {{ 'auth.signIn' | translate }}
          </a>
        </div>
      </form>
    </div>
  `
})
export class RegisterFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  /** Sign-up rules from the API; until they load, the API is the only check. */
  private registrationOptions: RegistrationOptions | null = null;

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(255)]],
    email: ['', [
      Validators.required,
      Validators.email,
      (control: AbstractControl) => this.allowedDomainValidator(control)
    ]],
    phone: ['', [Validators.maxLength(15)]],
    department: ['', [Validators.maxLength(255)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    password_confirmation: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  isLoading = false;
  errorMessage = '';
  /** e.g. "@uady.mx" — empty when any email is allowed */
  allowedDomainsHint = '';
  /** No domain allowed and public emails off: nobody can sign up right now */
  signUpClosed = false;

  ngOnInit(): void {
    this.authService.getRegistrationOptions().subscribe({
      next: (response) => {
        this.registrationOptions = response.data;
        this.allowedDomainsHint = response.data.allow_public_emails
          ? ''
          : response.data.allowed_domains.map((domain) => '@' + domain).join(', ');
        this.signUpClosed =
          !response.data.allow_public_emails && response.data.allowed_domains.length === 0;
        this.registerForm.controls.email.updateValueAndValidity();
      },
      // Not critical: the API still rejects an email it doesn't allow
      error: () => {}
    });
  }

  private allowedDomainValidator(control: AbstractControl): ValidationErrors | null {
    const email: string = control.value ?? '';

    if (!this.registrationOptions || !email.includes('@')) {
      return null;
    }
    return isEmailAllowed(email, this.registrationOptions) ? null : { domainNotAllowed: true };
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
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.registerForm.value;
      const data = {
        name: formValue.name!,
        email: formValue.email!,
        password: formValue.password!,
        password_confirmation: formValue.password_confirmation!,
        phone: formValue.phone || undefined,
        department: formValue.department || undefined
      };

      this.authService.register(data).subscribe({
        next: () => {
          // No session yet: the account is confirmed with the code we just emailed
          this.authService.setPendingVerification({
            email: data.email,
            password: data.password,
            codeSentAt: Date.now()
          });
          this.router.navigate(['/auth/verify-email']);
        },
        error: (error) => {
          if (error.status === 422) {
            // Validation errors
            const errors = error.error?.errors;
            if (errors?.email) {
              this.errorMessage = errors.email[0];
            } else if (errors?.password) {
              this.errorMessage = errors.password[0];
            } else {
              this.errorMessage = this.translationService.instant('auth.validationError');
            }
          } else if (error.status === 429) {
            // Signed up again within a minute: the code from the first try is
            // still valid, so go enter it
            this.authService.setPendingVerification({
              email: data.email,
              password: data.password,
              codeSentAt: Date.now()
            });
            this.router.navigate(['/auth/verify-email']);
            return;
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
