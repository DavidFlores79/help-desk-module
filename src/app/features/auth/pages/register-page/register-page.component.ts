import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegisterFormComponent } from '../../components/register-form/register-form.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, RegisterFormComponent, TranslatePipe],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-8">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-heading font-bold text-gray-900 mb-2">{{ 'auth.createAccount' | translate }}</h1>
          <p class="text-gray-600">{{ 'auth.registerToGetStarted' | translate }}</p>
        </div>
        <app-register-form></app-register-form>
      </div>
    </div>
  `
})
export class RegisterPageComponent {}
