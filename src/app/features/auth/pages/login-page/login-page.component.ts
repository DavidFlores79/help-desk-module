import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, LoginFormComponent, TranslatePipe],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-heading font-bold text-gray-900 mb-2">{{ 'app.title' | translate }}</h1>
          <p class="text-gray-600">{{ 'auth.signInToAccount' | translate }}</p>
        </div>
        <app-login-form></app-login-form>
      </div>
    </div>
  `
})
export class LoginPageComponent {}
