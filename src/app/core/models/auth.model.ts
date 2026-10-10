export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  jwt: string;  // API returns 'jwt' not 'token'
  user: AuthUser;
  code?: number;
  status?: string;
  success?: boolean;
}

export interface ProfileType {
  id: number;
  name: string;
  description?: string;
  is_admin?: boolean;
  is_superuser?: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  my_profile?: ProfileType;  // Profile object from API
  role?: UserRole;           // Computed role for internal use
  permissions?: string[];
  // Add any other fields your API returns
}

export type UserRole = 'user' | 'admin' | 'superuser';

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  employee_id?: string;
  department?: string;
}

/** Sign-up returns no session: the email must be confirmed with a code first. */
export interface RegisterResult {
  email: string;
  verification_required: boolean;
  code_expires_in_minutes: number;
}

/** Confirms a new account. The password is required so only its owner can confirm it. */
export interface VerifyEmailDto {
  email: string;
  password: string;
  code: string;
}

export interface ResendVerificationDto {
  email: string;
  password: string;
}

/** Session returned by the v1 auth endpoints (verify-email). */
export interface SessionPayload {
  user: AuthUser;
  token: string;
  token_type: string;
  expires_at: number;
}

/** Why a code was rejected (in `errors.reason` of a 400 from verify-email). */
export type VerificationFailure = 'invalid_code' | 'expired' | 'too_many_attempts' | 'not_pending';

export interface ForgotPasswordDto {
  email: string;
}

/** Same answer whether or not the email has an account; the link only arrives by email. */
export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface VerifyResetTokenDto {
  email: string;
  token: string;
}

export interface VerifyResetTokenResponse {
  success: boolean;
  message: string;
  data?: {
    valid: boolean;
    email: string;
  };
}

export interface ResetPasswordDto {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordDto {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}
