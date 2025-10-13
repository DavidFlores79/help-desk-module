import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo and Navigation -->
          <div class="flex items-center gap-8">
            <h1 class="text-xl font-heading font-bold text-primary-600">
              {{ 'app.title' | translate }}
            </h1>
            
            <nav class="flex items-center gap-4">
              <a routerLink="/tickets" 
                 routerLinkActive="text-primary-600 font-semibold"
                 [routerLinkActiveOptions]="{exact: false}"
                 class="text-gray-700 hover:text-primary-600 transition-colors">
                {{ 'nav.myTickets' | translate }}
              </a>
              
              @if (authService.isAdmin()) {
                <a routerLink="/admin" 
                   routerLinkActive="text-primary-600 font-semibold"
                   class="text-gray-700 hover:text-primary-600 transition-colors">
                  {{ 'nav.admin' | translate }}
                </a>
                
                <a routerLink="/settings" 
                   routerLinkActive="text-primary-600 font-semibold"
                   class="text-gray-700 hover:text-primary-600 transition-colors">
                  {{ 'nav.settings' | translate }}
                </a>
              }
            </nav>
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-4">
            @if (authService.currentUser$ | async; as user) {
              <div class="flex items-center gap-3">
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                  <p class="text-xs text-gray-500">{{ user.email }}</p>
                </div>
                
                <button 
                  (click)="logout()"
                  class="btn-secondary text-sm px-4 py-2"
                  [title]="'auth.logout' | translate">
                  <svg class="w-4 h-4 mr-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {{ 'auth.logout' | translate }}
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  authService = inject(AuthService);

  logout(): void {
    console.log('🔐 [HEADER] User logging out');
    this.authService.logout();
  }
}
