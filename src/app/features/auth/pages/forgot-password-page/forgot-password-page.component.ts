import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgotPasswordFormComponent } from '../../components/forgot-password-form/forgot-password-form.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, ForgotPasswordFormComponent, TranslatePipe],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-heading font-bold text-gray-900 mb-2">{{ 'auth.resetPassword' | translate }}</h1>
          <p class="text-gray-600">{{ 'auth.enterEmailToReset' | translate }}</p>
        </div>
        <app-forgot-password-form></app-forgot-password-form>
      </div>
    </div>
  `
})
export class ForgotPasswordPageComponent {}
