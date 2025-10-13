import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';

interface Translations {
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly STORAGE_KEY = 'app_language';
  private readonly DEFAULT_LANGUAGE = 'es-MX';
  private readonly AVAILABLE_LANGUAGES = ['es-MX', 'en'];
  
  private currentLang = this.DEFAULT_LANGUAGE;
  private translations: Translations = {};
  private translationsLoaded = new BehaviorSubject<boolean>(false);
  public translationsLoaded$ = this.translationsLoaded.asObservable();

  constructor() {
    // Don't auto-initialize, let app component do it
  }

  /**
   * Initialize language - call this from app component
   */
  init(): Promise<void> {
    const storedLang = this.getStoredLanguage();
    const langToUse = storedLang || this.DEFAULT_LANGUAGE;
    return this.loadTranslations(langToUse);
  }

  /**
   * Load translations for a language using fetch to bypass interceptors
   */
  private async loadTranslations(lang: string): Promise<void> {
    try {
      const translationUrl = `/assets/i18n/${lang}.json`;
      const response = await fetch(translationUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to load translations: ${response.status}`);
      }
      
      this.translations = await response.json();
      this.currentLang = lang;
      this.translationsLoaded.next(true);
    } catch (error) {
      console.warn(`Failed to load translations for ${lang}:`, error);
      
      // Fallback to default language if loading fails
      if (lang !== this.DEFAULT_LANGUAGE) {
        try {
          const fallbackUrl = `/assets/i18n/${this.DEFAULT_LANGUAGE}.json`;
          const response = await fetch(fallbackUrl);
          
          if (response.ok) {
            this.translations = await response.json();
            this.currentLang = this.DEFAULT_LANGUAGE;
            this.translationsLoaded.next(true);
            return;
          }
        } catch (fallbackError) {
          console.error('Failed to load fallback translations:', fallbackError);
        }
      }
      
      // If all fails, use empty translations
      this.translations = {};
      this.translationsLoaded.next(true);
    }
  }

  /**
   * Get current language
   */
  getCurrentLanguage(): string {
    return this.currentLang;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): string[] {
    return this.AVAILABLE_LANGUAGES;
  }

  /**
   * Change language
   */
  changeLanguage(lang: string): void {
    if (this.AVAILABLE_LANGUAGES.includes(lang)) {
      this.storeLanguage(lang);
      // Reload page to apply new language
      window.location.reload();
    }
  }

  /**
   * Get translation for a key
   */
  instant(key: string, params?: any): string {
    if (!key) {
      return '';
    }

    const translation = this.getNestedTranslation(key);
    
    if (!translation) {
      // Return key as fallback during development
      return key;
    }

    return this.interpolate(translation, params);
  }

  /**
   * Get translation observable for a key
   */
  get(key: string, params?: any): Observable<string> {
    return of(this.instant(key, params));
  }

  /**
   * Get nested translation by dot notation
   */
  private getNestedTranslation(key: string): string {
    const keys = key.split('.');
    let result: any = this.translations;

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return '';
      }
    }

    return typeof result === 'string' ? result : '';
  }

  /**
   * Interpolate parameters in translation
   */
  private interpolate(text: string, params?: any): string {
    if (!params) {
      return text;
    }

    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }

  /**
   * Store language preference in localStorage
   */
  private storeLanguage(lang: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, lang);
    } catch (e) {
      console.error('Failed to store language preference:', e);
    }
  }

  /**
   * Get stored language preference from localStorage
   */
  private getStoredLanguage(): string | null {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Failed to get stored language:', e);
      return null;
    }
  }

  /**
   * Get language name for display
   */
  getLanguageName(lang: string): string {
    const names: { [key: string]: string } = {
      'es-MX': 'Español (México)',
      'en': 'English'
    };
    return names[lang] || lang;
  }

  /**
   * Check if language is RTL
   */
  isRTL(): boolean {
    const rtlLanguages = ['ar', 'he', 'fa'];
    return rtlLanguages.includes(this.getCurrentLanguage());
  }

  /**
   * Check if translations are loaded
   */
  isLoaded(): boolean {
    return this.translationsLoaded.value;
  }
}
