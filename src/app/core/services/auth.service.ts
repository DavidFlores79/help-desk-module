import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  LoginCredentials,
  LoginResponse,
  AuthUser,
  RegisterDto,
  UserRole,
  ForgotPasswordDto,
  ForgotPasswordResponse,
  VerifyResetTokenDto,
  VerifyResetTokenResponse,
  ResetPasswordDto,
  ResetPasswordResponse,
  ChangePasswordDto,
  ChangePasswordResponse
} from '../models/auth.model';
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
    const token = this.getToken();
    const user = this.getUserFromStorage();

    if (token && user) {
      this.currentUserSubject.next(user);
      this.isAuthenticated.set(true);
    }
  }

  login(credentials: LoginCredentials): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.jwt && response.user) {
          const user = this.normalizeUser(response.user);
          this.setSession(response.jwt, user);
        }
      })
    );
  }

  register(data: RegisterDto): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/v1/auth/register`, data).pipe(
      tap(response => {
        if (response.jwt && response.user) {
          const user = this.normalizeUser(response.user);
          this.setSession(response.jwt, user);
        }
      })
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Normalize user data from API to include computed role field
   * Maps my_profile.name to internal role
   */
  private normalizeUser(user: any): AuthUser {
    let role: UserRole = 'user';

    if (user.my_profile && user.my_profile.name) {
      const profileName = user.my_profile.name.toLowerCase();
      if (profileName === 'superuser') {
        role = 'superuser';
      } else if (profileName === 'administrador' || profileName === 'admin') {
        role = 'admin';
      }
    }

    return { ...user, role };
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
    if (!user) return false;

    // Check computed role field (set by normalizeUser)
    if (user.role) {
      return user.role === 'admin' || user.role === 'superuser';
    }

    // Fallback: check my_profile.name directly
    if (user.my_profile && user.my_profile.name) {
      const profileName = user.my_profile.name.toLowerCase();
      return profileName === 'administrador' || profileName === 'admin' || profileName === 'superuser';
    }

    // Check for permissions array if it exists
    if (user.permissions && Array.isArray(user.permissions)) {
      return user.permissions.includes('admin') || user.permissions.includes('superuser');
    }

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

  /**
   * Request a password reset email
   */
  forgotPassword(data: ForgotPasswordDto): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${environment.apiUrl}/v1/auth/forgot-password`, data);
  }

  /**
   * Verify a password reset token is valid
   */
  verifyResetToken(data: VerifyResetTokenDto): Observable<VerifyResetTokenResponse> {
    return this.http.post<VerifyResetTokenResponse>(`${environment.apiUrl}/v1/auth/verify-reset-token`, data);
  }

  /**
   * Reset the password using a valid token
   */
  resetPassword(data: ResetPasswordDto): Observable<ResetPasswordResponse> {
    return this.http.post<ResetPasswordResponse>(`${environment.apiUrl}/v1/auth/reset-password`, data);
  }

  /**
   * Change password for authenticated user
   */
  changePassword(data: ChangePasswordDto): Observable<ChangePasswordResponse> {
    return this.http.post<ChangePasswordResponse>(`${environment.apiUrl}/v1/auth/change-password`, data);
  }
}
