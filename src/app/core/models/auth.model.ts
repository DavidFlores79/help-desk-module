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
}
