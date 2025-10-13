import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { TranslationService } from '../../../core/services/translation.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="language-selector">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        {{ 'settings.language' | translate }}
      </label>
      
      <div class="relative">
        <select
          [value]="translationService.getCurrentLanguage()"
          (change)="onLanguageChange($event)"
          [disabled]="!canChangeLanguage()"
          class="input-field appearance-none cursor-pointer"
          [class.opacity-50]="!canChangeLanguage()"
          [class.cursor-not-allowed]="!canChangeLanguage()">
          
          @for (lang of availableLanguages; track lang) {
            <option [value]="lang">
              {{ translationService.getLanguageName(lang) }}
            </option>
          }
        </select>
        
        <!-- Dropdown arrow -->
        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      @if (!canChangeLanguage()) {
        <p class="mt-2 text-sm text-amber-600 flex items-center gap-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {{ 'settings.onlyAdmins' | translate }}
        </p>
      }

      @if (successMessage) {
        <div class="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          {{ successMessage }}
        </div>
      }

      @if (errorMessage) {
        <div class="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {{ errorMessage }}
        </div>
      }
    </div>
  `,
  styles: [`
    .language-selector {
      @apply w-full max-w-md;
    }
  `]
})
export class LanguageSelectorComponent {
  translationService = inject(TranslationService);
  private authService = inject(AuthService);

  availableLanguages = this.translationService.getAvailableLanguages();
  successMessage = '';
  errorMessage = '';

  canChangeLanguage(): boolean {
    return true; // Allow all users to change language
  }

  onLanguageChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const newLang = select.value;

    if (!this.canChangeLanguage()) {
      this.errorMessage = this.translationService.instant('settings.onlyAdmins');
      // Reset to current language
      setTimeout(() => {
        select.value = this.translationService.getCurrentLanguage();
      }, 0);
      return;
    }

    // Clear messages
    this.successMessage = '';
    this.errorMessage = '';

    try {
      this.translationService.changeLanguage(newLang);
      this.successMessage = this.translationService.instant('settings.languageChanged');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error) {
      this.errorMessage = this.translationService.instant('settings.languageError');
      console.error('Error changing language:', error);
    }
  }
}
