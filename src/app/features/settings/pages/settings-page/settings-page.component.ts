import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { LanguageSelectorComponent } from '../../../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    RouterModule,
    HeaderComponent,
    LanguageSelectorComponent
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header></app-header>

      <main class="container-custom py-8">
        <!-- Page Header -->
        <div class="mb-8 ml-2">
          <h1 class="text-3xl font-heading font-bold text-gray-900 mb-2">
            {{ 'settings.settings' | translate }}
          </h1>
          <p class="text-gray-600">
            {{ 'settings.preferences' | translate }}
          </p>
        </div>

        <!-- Settings Card -->
        <div class="card max-w-4xl">
          <!-- General Settings Section -->
          <div class="border-b border-gray-200 pb-6 mb-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-4 ml-2 flex items-center gap-2">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {{ 'settings.general' | translate }}
            </h2>

            <!-- Language Selector -->
            <div class="space-y-4 ml-4">
              <app-language-selector></app-language-selector>
            </div>
          </div>

          <!-- Additional Settings Sections (Placeholders) -->
          <div class="space-y-6">
            <!-- Notifications Section -->
            <div class="border-b border-gray-200 pb-6">
              <h2 class="text-xl font-semibold text-gray-900 mb-4 ml-2 flex items-center gap-2">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {{ 'settings.notifications' | translate }}
              </h2>
              <p class="text-gray-600 text-sm ml-4">
                {{ 'app.info' | translate }}: {{ 'settings.notifications' | translate }} (Coming soon)
              </p>
            </div>

            <!-- Security Section -->
            <div>
              <h2 class="text-xl font-semibold text-gray-900 mb-4 ml-2 flex items-center gap-2">
                <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                {{ 'settings.security' | translate }}
              </h2>
              <p class="text-gray-600 text-sm ml-4">
                {{ 'app.info' | translate }}: {{ 'settings.security' | translate }} (Coming soon)
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class SettingsPageComponent {}
