import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { AuthService } from '../../../core/services/auth.service';
import { LoggerService } from '../../../core/services/logger.service';

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
            <div class="flex items-center gap-3">
              <img 
                src="assets/images/brand/logo.png" 
                alt="Help Desk Logo" 
                class="h-10 w-auto"
              />
              <h1 class="text-xl font-heading font-bold text-primary-600">
                {{ 'app.title' | translate }}
              </h1>
            </div>
            
            <nav class="flex items-center gap-4">
              <a routerLink="/tickets" 
                 routerLinkActive="text-primary-600 font-semibold"
                 [routerLinkActiveOptions]="{exact: false}"
                 class="text-gray-700 hover:text-primary-600 transition-colors">
                {{ 'nav.myTickets' | translate }}
              </a>
              
              @if (authService.isAdmin()) {
                <!-- Admin Dropdown -->
                <div class="relative">
                  <button 
                    (click)="showAdminMenu = !showAdminMenu"
                    class="flex items-center gap-1 text-gray-700 hover:text-primary-600 transition-colors"
                    [class.text-primary-600]="showAdminMenu">
                    {{ 'nav.admin' | translate }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  @if (showAdminMenu) {
                    <div class="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <a routerLink="/admin" 
                         (click)="showAdminMenu = false"
                         class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        {{ 'admin.dashboard' | translate }}
                      </a>
                      <a routerLink="/admin/categories" 
                         (click)="showAdminMenu = false"
                         class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        {{ 'admin.ticketCategories' | translate }}
                      </a>
                    </div>
                  }
                </div>
              }
            </nav>
          </div>

          <!-- User Menu -->
          <div class="flex items-center gap-4">
            @if (authService.currentUser$ | async; as user) {
              <div class="relative">
                <button 
                  (click)="showUserMenu = !showUserMenu"
                  class="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                  <!-- Avatar -->
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
                    {{ getInitials(user.name) }}
                  </div>
                  
                  <div class="text-left hidden md:block">
                    <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                    <p class="text-xs text-gray-500">{{ user.email }}</p>
                  </div>
                  
                  <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- User Dropdown -->
                @if (showUserMenu) {
                  <div class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div class="px-4 py-3 border-b border-gray-200">
                      <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                      <p class="text-xs text-gray-500">{{ user.email }}</p>
                    </div>
                    
                    <a routerLink="/settings" 
                       (click)="showUserMenu = false"
                       class="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {{ 'nav.settings' | translate }}
                    </a>
                    
                    <button 
                      (click)="logout()"
                      class="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger-700 hover:bg-danger-50">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      {{ 'auth.logout' | translate }}
                    </button>
                  </div>
                }
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
  private logger = inject(LoggerService);
  
  showAdminMenu = false;
  showUserMenu = false;

  getInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  logout(): void {
    this.showUserMenu = false;
    this.logger.log('🔐', '[HEADER] User logging out');
    this.authService.logout();
  }
}
