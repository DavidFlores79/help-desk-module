import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LoginCredentials, LoginResponse, AuthUser, RegisterDto, UserRole } from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Signal for reactive state
  public isAuthenticated = signal<boolean>(!!this.getToken());

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth(): void {
    console.log('🔧 [AUTH] Initializing auth service...');
    const token = this.getToken();
    const user = this.getUserFromStorage();
    
    console.log('🔧 [AUTH] Auth state:', {
      hasToken: !!token,
      hasUser: !!user,
      user: user
    });
    
    if (token && user) {
      console.log('✅ [AUTH] Existing session found, restoring...');
      this.currentUserSubject.next(user);
      this.isAuthenticated.set(true);
    } else {
      console.log('ℹ️ [AUTH] No existing session found');
    }
  }

  login(credentials: LoginCredentials): Observable<any> {
    const loginUrl = `${environment.apiUrl}/login`;
    console.log('🔐 [AUTH] Attempting login...', {
      url: loginUrl,
      email: credentials.email,
      environment: environment.production ? 'production' : 'development'
    });

    return this.http.post<any>(
      loginUrl,
      credentials
    ).pipe(
      tap(response => {
        console.log('✅ [AUTH] Login response received:', response);
        
        // Handle the actual API response format
        if (response.success && response.jwt && response.user) {
          console.log('✅ [AUTH] Login successful, setting session...');
          const user = this.normalizeUser(response.user);
          this.setSession(response.jwt, user);
          console.log('✅ [AUTH] Session set, user authenticated with role:', user.role);
        } else if (response.jwt && response.user) {
          // Handle case where success field might not exist
          console.log('✅ [AUTH] Login successful (no success field), setting session...');
          const user = this.normalizeUser(response.user);
          this.setSession(response.jwt, user);
          console.log('✅ [AUTH] Session set, user authenticated with role:', user.role);
        } else {
          console.warn('⚠️ [AUTH] Login response missing jwt or user:', response);
        }
      }),
      catchError(error => {
        console.error('❌ [AUTH] Login failed:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          url: loginUrl,
          error: error
        });
        throw error;
      })
    );
  }

  register(data: RegisterDto): Observable<any> {
    return this.http.post<any>(
      `${environment.apiUrl}/register`,
      data
    ).pipe(
      tap(response => {
        console.log('✅ [AUTH] Registration response:', response);
        if (response.jwt && response.user) {
          const user = this.normalizeUser(response.user);
          this.setSession(response.jwt, user);
        }
      })
    );
  }

  logout(): void {
    console.log('🚪 [AUTH] Logging out...');
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Normalize user data from API to include computed role field
   * Maps my_profile.name to internal role
   */
  private normalizeUser(user: any): AuthUser {
    console.log('🔄 [AUTH] Normalizing user data:', user);
    
    let role: UserRole = 'user'; // default role
    
    // Check if my_profile exists and has a name field
    if (user.my_profile && user.my_profile.name) {
      const profileName = user.my_profile.name.toLowerCase();
      console.log('🔍 [AUTH] Profile name found:', user.my_profile.name);
      
      if (profileName === 'superuser') {
        role = 'superuser';
      } else if (profileName === 'administrador' || profileName === 'admin') {
        role = 'admin';
      } else {
        role = 'user';
      }
      
      console.log('✅ [AUTH] Mapped profile to role:', role);
    } else {
      console.warn('⚠️ [AUTH] No my_profile found in user data, defaulting to "user" role');
    }
    
    return {
      ...user,
      role: role
    };
  }

  private setSession(token: string, user: AuthUser): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.isAuthenticated.set(true);
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getUserFromStorage(): AuthUser | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    if (!user) {
      console.log('🔍 [AUTH] isAdmin check: No user found');
      return false;
    }
    
    console.log('🔍 [AUTH] isAdmin check for user:', {
      id: user.id,
      name: user.name,
      role: user.role,
      profile: user.my_profile
    });
    
    // Check computed role field (set by normalizeUser)
    if (user.role) {
      const isAdmin = user.role === 'admin' || user.role === 'superuser';
      console.log(`✅ [AUTH] Admin check result: ${isAdmin} (role: ${user.role})`);
      return isAdmin;
    }
    
    // Fallback: check my_profile.name directly
    if (user.my_profile && user.my_profile.name) {
      const profileName = user.my_profile.name.toLowerCase();
      const isAdmin = profileName === 'administrador' || 
                     profileName === 'admin' || 
                     profileName === 'superuser';
      console.log(`✅ [AUTH] Admin check result (from profile): ${isAdmin} (profile: ${user.my_profile.name})`);
      return isAdmin;
    }
    
    // Check for permissions array if it exists
    if (user.permissions && Array.isArray(user.permissions)) {
      const isAdmin = user.permissions.includes('admin') || user.permissions.includes('superuser');
      console.log(`✅ [AUTH] Admin check result (from permissions): ${isAdmin}`);
      return isAdmin;
    }
    
    console.warn('⚠️ [AUTH] Could not determine admin status');
    return false;
  }

  isSuperUser(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Check computed role field
    if (user.role) {
      return user.role === 'superuser';
    }
    
    // Fallback: check my_profile.name directly
    if (user.my_profile && user.my_profile.name) {
      return user.my_profile.name.toLowerCase() === 'superuser';
    }
    
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes('superuser');
    }
    
    return false;
  }

  hasRole(role: string | string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    const roles = Array.isArray(role) ? role : [role];
    
    // Check computed role field
    if (user.role && roles.includes(user.role)) {
      return true;
    }
    
    // Check my_profile.name
    if (user.my_profile && user.my_profile.name) {
      const profileName = user.my_profile.name.toLowerCase();
      if (roles.some(r => r.toLowerCase() === profileName || 
                         (r === 'admin' && profileName === 'administrador'))) {
        return true;
      }
    }
    
    // Check permissions array
    if (user.permissions && Array.isArray(user.permissions)) {
      return roles.some(r => user.permissions!.includes(r));
    }
    
    return false;
  }
}
