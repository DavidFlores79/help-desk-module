import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('help-desk-module');

  ngOnInit(): void {
    console.log('%c🚀 Help Desk Application Started', 'color: #0ea5e9; font-size: 16px; font-weight: bold;');
    console.log('%c📋 Configuration:', 'color: #0ea5e9; font-weight: bold;');
    console.table({
      'Environment': environment.production ? 'Production' : 'Development',
      'API URL': environment.apiUrl,
      'API Timeout': `${environment.apiTimeout}ms`,
      'Retry Attempts': environment.retryAttempts,
      'Log Level': environment.logLevel
    });
    console.log('%c💡 Tip: All HTTP requests will be logged in the console', 'color: #f59e0b;');
    console.log('═'.repeat(80));
  }
}
