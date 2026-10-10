import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerifyEmailFormComponent } from '../../components/verify-email-form/verify-email-form.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  imports: [CommonModule, VerifyEmailFormComponent, TranslatePipe],
  template: `
    <div
      class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-8"
    >
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-heading font-bold text-gray-900 mb-2">
            {{ 'auth.verifyEmailTitle' | translate }}
          </h1>
          <p class="text-gray-600">{{ 'auth.verifyEmailSubtitle' | translate }}</p>
        </div>
        <app-verify-email-form></app-verify-email-form>
      </div>
    </div>
  `,
})
export class VerifyEmailPageComponent {}
