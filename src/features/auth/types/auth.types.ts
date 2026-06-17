import type { Role } from '@/shared/types/role.types';

export interface AuthUser {
  id:         string;
  employeeId: string;
  fullName:   string;
  role:       Role;
  avatarUrl?: string;
}

export interface AuthState {
  user:          AuthUser | null;
  token:         string | null;
  isAuthenticated: boolean;
  isLoading:     boolean;
}

export interface LoginCredentials {
  employeeId:  string;
  password:    string;
  rememberMe?: boolean;
}

export interface SetPasswordPayload {
  token:           string;
  password:        string;
  confirmPassword: string;
}

export interface AuthLoginResponse {
  token:   string;
  user:    AuthUser;
}

export interface InviteTokenPayload {
  employeeId: string;
  fullName:   string;
  exp:        number;
}
