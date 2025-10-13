import { Component, signal, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { environment } from '../environments/environment';
import { TranslationService } from './core/services/translation.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('help-desk-module');
  protected readonly translationsReady = signal(false);
  private translationService = inject(TranslationService);

  async ngOnInit(): Promise<void> {
    // Initialize translations first
    await this.translationService.init();
    this.translationsReady.set(true);
    
    console.log('%c🚀 Help Desk Application Started', 'color: #0ea5e9; font-size: 16px; font-weight: bold;');
    console.log('%c📋 Configuration:', 'color: #0ea5e9; font-weight: bold;');
    console.table({
      'Environment': environment.production ? 'Production' : 'Development',
      'API URL': environment.apiUrl,
      'API Timeout': `${environment.apiTimeout}ms`,
      'Retry Attempts': environment.retryAttempts,
      'Log Level': environment.logLevel,
      'Language': this.translationService.getCurrentLanguage()
    });
    console.log('%c💡 Tip: All HTTP requests will be logged in the console', 'color: #f59e0b;');
    console.log('═'.repeat(80));
  }
}
