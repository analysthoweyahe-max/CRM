import type { Role } from '@/shared/types/role.types';

// ─── Internal / normalized types ────────────────────────────────────────────

export interface AuthUser {
  id:         string;
  employeeId: string;
  fullName:   string;
  role:       Role;
  avatarUrl?: string;
}

export interface AuthState {
  user:            AuthUser | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
}

export interface LoginCredentials {
  employeeId:  string;   // email (employee) OR admin_id UUID (admin/hr)
  password:    string;
  rememberMe?: boolean;
}

export interface SetPasswordPayload {
  token:           string;
  password:        string;
  confirmPassword: string;
  rememberMe?:     boolean;
  inviteType?:     'admin' | 'employee';
}

export interface AuthLoginResponse {
  token: string;
  user:  AuthUser;
}

export interface InviteTokenPayload {
  name:       string;
  email:      string;
  exp:        number;
  inviteType: 'admin' | 'employee';
}

// ─── Raw API response shapes ─────────────────────────────────────────────────

export interface ApiAdmin {
  id:          string;
  name:        string;
  email:       string;
  roles:       string[];   // e.g. ['super-admin'] | ['hr-manager']
  avatar_url?: string;
  phone?:      string | null;
  status?:     string;
}

export interface ApiEmployee {
  id:          string;
  name:        string;
  email:       string;
  avatar_url?: string;
}

export interface AdminLoginApiResponse {
  data: {
    accessToken: string;
    admin:       ApiAdmin;
  };
}

export interface EmployeeLoginApiResponse {
  data: {
    accessToken: string;
    employee:    ApiEmployee;
  };
}

export interface AdminInviteApiResponse {
  data: {
    name:  string;
    email: string;
    exp?:  number;
  };
}

export interface EmployeeInviteApiResponse {
  data: {
    name:  string;
    email: string;
    exp?:  number;
  };
}
