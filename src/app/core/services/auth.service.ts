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
  ChangePasswordResponse,
  RegisterResult,
  VerifyEmailDto,
  ResendVerificationDto,
  SessionPayload
} from '../models/auth.model';
import { ApiResponse } from '../models/api-response.model';
import { RegistrationOptions } from '../models/registration-settings.model';

/**
 * Credentials of a sign-up waiting for its email code. Kept in memory only
 * (never in storage), so the code screen doesn't ask for the password again
 * right after sign-up or login. A page reload clears it.
 */
export interface PendingVerification {
  email: string;
  password: string;
  /** When the last code was emailed (ms), to show the resend countdown */
  codeSentAt: number | null;
}

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

  private pendingVerification: PendingVerification | null = null;

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
          this.clearPendingVerification();
        }
      })
    );
  }

  /** Creates the account and emails a code; there is no session until verifyEmail(). */
  register(data: RegisterDto): Observable<ApiResponse<RegisterResult>> {
    return this.http.post<ApiResponse<RegisterResult>>(
      `${environment.apiUrl}/v1/auth/register`,
      data
    );
  }

  /** Confirms the email with the emailed code and starts the session. */
  verifyEmail(data: VerifyEmailDto): Observable<ApiResponse<SessionPayload>> {
    return this.http
      .post<ApiResponse<SessionPayload>>(`${environment.apiUrl}/v1/auth/verify-email`, data)
      .pipe(
        tap(response => {
          this.setSession(response.data.token, this.normalizeUser(response.data.user));
          this.clearPendingVerification();
        })
      );
  }

  /** Emails a new code (the API allows one per minute). */
  resendVerification(
    data: ResendVerificationDto
  ): Observable<ApiResponse<{ code_expires_in_minutes: number }>> {
    return this.http.post<ApiResponse<{ code_expires_in_minutes: number }>>(
      `${environment.apiUrl}/v1/auth/resend-verification`,
      data
    );
  }

  /** Which emails may sign up, so the form can say so before submitting. */
  getRegistrationOptions(): Observable<ApiResponse<RegistrationOptions>> {
    return this.http.get<ApiResponse<RegistrationOptions>>(
      `${environment.apiUrl}/v1/auth/registration-options`
    );
  }

  setPendingVerification(pending: PendingVerification): void {
    this.pendingVerification = pending;
  }

  getPendingVerification(): PendingVerification | null {
    return this.pendingVerification;
  }

  /** Forget the password once it isn't needed (also on logout and leaving the code screen). */
  clearPendingVerification(): void {
    this.pendingVerification = null;
  }

  logout(): void {
    this.clearSession();
    this.clearPendingVerification();
    this.router.navigate(['/auth/login']);
  }

  private normalizeUser(user: any): AuthUser {
    let role: UserRole = 'user';

    if (user.my_profile?.is_superuser === true) {
      role = 'superuser';
    } else if (user.my_profile?.is_admin === true) {
      role = 'admin';
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
    return user.my_profile?.is_admin === true || user.my_profile?.is_superuser === true;
  }

  isSuperUser(): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    return user.my_profile?.is_superuser === true;
  }

  hasRole(role: string | string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const roles = Array.isArray(role) ? role : [role];
    return user.role !== undefined && roles.includes(user.role);
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
