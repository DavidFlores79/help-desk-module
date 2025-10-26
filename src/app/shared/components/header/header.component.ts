import { Component, inject, HostListener } from '@angular/core';
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
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div class="flex items-center justify-between">
          <!-- Logo and Hamburger -->
          <div class="flex items-center gap-3 sm:gap-4">
            <!-- Hamburger Menu Button (Mobile) -->
            <button 
              (click)="toggleMobileMenu()"
              class="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              [attr.aria-label]="'Toggle menu'"
              [attr.aria-expanded]="showMobileMenu">
              <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <!-- Logo -->
            <div class="flex items-center gap-2 sm:gap-3">
              <img 
                src="assets/images/brand/logo.png" 
                alt="Help Desk Logo" 
                class="h-8 sm:h-10 w-auto"
              />
              <h1 class="text-base sm:text-xl font-heading font-bold text-primary-600 hidden sm:block">
                {{ 'app.title' | translate }}
              </h1>
            </div>
          </div>
          
          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center gap-4">
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

          <!-- User Menu -->
          <div class="flex items-center gap-2 sm:gap-4">
            @if (authService.currentUser$ | async; as user) {
              <div class="relative">
                <button 
                  (click)="showUserMenu = !showUserMenu"
                  class="flex items-center gap-2 sm:gap-3 hover:bg-gray-50 rounded-lg p-1.5 sm:p-2 transition-colors">
                  <!-- Avatar -->
                  <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                    {{ getInitials(user.name) }}
                  </div>
                  
                  <div class="text-left hidden md:block">
                    <p class="text-sm font-medium text-gray-900 truncate max-w-[120px]">{{ user.name }}</p>
                    <p class="text-xs text-gray-500 truncate max-w-[120px]">{{ user.email }}</p>
                  </div>
                  
                  <svg class="w-4 h-4 text-gray-500 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <!-- User Dropdown -->
                @if (showUserMenu) {
                  <div class="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div class="px-4 py-3 border-b border-gray-200 md:hidden">
                      <p class="text-sm font-medium text-gray-900 truncate">{{ user.name }}</p>
                      <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
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

    <!-- Mobile Side Drawer Overlay -->
    @if (showMobileMenu) {
      <div 
        class="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden transition-opacity"
        (click)="closeMobileMenu()"
        [@fadeIn]>
      </div>
    }

    <!-- Mobile Side Drawer -->
    <div 
      class="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden"
      [class.translate-x-0]="showMobileMenu"
      [class.-translate-x-full]="!showMobileMenu">
      
      <!-- Drawer Header -->
      <div class="flex items-center justify-between p-4 border-b border-gray-200">
        <div class="flex items-center gap-3">
          <img 
            src="assets/images/brand/logo.png" 
            alt="Help Desk Logo" 
            class="h-8 w-auto"
          />
          <h2 class="text-lg font-heading font-bold text-primary-600">
            {{ 'app.title' | translate }}
          </h2>
        </div>
        <button 
          (click)="closeMobileMenu()"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <svg class="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Drawer Navigation -->
      <nav class="p-4 space-y-2">
        <a routerLink="/tickets" 
           (click)="closeMobileMenu()"
           routerLinkActive="bg-primary-50 text-primary-600 font-semibold"
           [routerLinkActiveOptions]="{exact: false}"
           class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {{ 'nav.myTickets' | translate }}
        </a>
        
        @if (authService.isAdmin()) {
          <div class="pt-4 pb-2">
            <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {{ 'nav.admin' | translate }}
            </div>
          </div>
          
          <a routerLink="/admin" 
             (click)="closeMobileMenu()"
             routerLinkActive="bg-primary-50 text-primary-600"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {{ 'admin.dashboard' | translate }}
          </a>
          
          <a routerLink="/admin/categories" 
             (click)="closeMobileMenu()"
             routerLinkActive="bg-primary-50 text-primary-600"
             class="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {{ 'admin.ticketCategories' | translate }}
          </a>
        }
      </nav>

      <!-- User Info at Bottom -->
      @if (authService.currentUser$ | async; as user) {
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold">
              {{ getInitials(user.name) }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ user.name }}</p>
              <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);
  private logger = inject(LoggerService);
  
  showAdminMenu = false;
  showUserMenu = false;
  showMobileMenu = false;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative')) {
      this.showAdminMenu = false;
      this.showUserMenu = false;
    }
  }

  toggleMobileMenu(): void {
    this.showMobileMenu = !this.showMobileMenu;
    // Prevent body scroll when menu is open
    if (this.showMobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  closeMobileMenu(): void {
    this.showMobileMenu = false;
    document.body.style.overflow = '';
  }

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
