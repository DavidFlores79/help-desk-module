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
  name: string; // 'Administrador', 'Usuario', 'SuperUser'
  description?: string;
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

export interface ForgotPasswordDto {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  data?: {
    message: string;
    token?: string; // Only returned in development environment
  };
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
