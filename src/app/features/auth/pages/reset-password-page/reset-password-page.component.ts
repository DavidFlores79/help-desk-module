import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResetPasswordFormComponent } from '../../components/reset-password-form/reset-password-form.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [CommonModule, ResetPasswordFormComponent, TranslatePipe],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-heading font-bold text-gray-900 mb-2">{{ 'auth.createNewPassword' | translate }}</h1>
          <p class="text-gray-600">{{ 'auth.enterNewPassword' | translate }}</p>
        </div>
        <app-reset-password-form></app-reset-password-form>
      </div>
    </div>
  `
})
export class ResetPasswordPageComponent {}
