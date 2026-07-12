import type { Role } from '@/shared/types/role.types';

// ─── Internal / normalized types ────────────────────────────────────────────

/** Wrapped API envelope from the backend. */
export interface ApiResponse<T> {
  status:  'true' | 'false' | string;
  message: string;
  data:    T;
}

export type AuthActor = 'admin' | 'employee';

export interface RoleDetail {
  name:        string;
  permissions: string[];
}

export interface AuthUser {
  id:          string;
  employeeId:  string;
  fullName:    string;
  email?:      string;
  role:        Role;
  /** Raw backend role slugs from the auth response. */
  roles:       string[];
  /** Effective permissions from the auth response (Spatie or config-driven). */
  permissions: string[];
  /** Per-role permission breakdown when provided by the backend. */
  roleDetails?: RoleDetail[];
  /** Backend super-admin flag — bypasses all permission checks in the UI. */
  isSuperAdmin?: boolean;
  /** Employee section slug (e.g. pm, seo). */
  section?:      string;
  /** Human-readable employee section label. */
  sectionLabel?: string;
  /** Which auth guard this session belongs to — drives profile/logout endpoints. */
  actor:       AuthActor;
  avatarUrl?:  string;
  phone?:      string | null;
}

export interface AuthState {
  user:            AuthUser | null;
  token:           string | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
}

export interface LoginCredentials {
  email:       string;
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
  token:         string;
  user:          AuthUser;
  redirectPath?: string;
}

export type LoginResult =
  | { status: 'success'; token: string; user: AuthUser; redirectPath?: string };

export interface InviteTokenPayload {
  name:          string;
  email:         string;
  exp:           number;
  inviteType:    'admin' | 'employee';
  // Present when the token is already activated — the backend logs the user
  // straight in instead of requiring a new password.
  accessToken?:  string;
  redirectPath?: string;
  admin?:        ApiAdmin;
  employee?:     ApiEmployee;
}

// ─── Raw API response shapes ─────────────────────────────────────────────────

/** Admin manager profile from Spatie guard (`admin`). */
export interface AdminUser {
  id:            string;
  name:          string;
  email:         string;
  roles:         string[];
  roleDetails?:  RoleDetail[];
  permissions:   string[];
  isSuperAdmin?: boolean;
  avatar_url?:   string;
  phone?:        string | null;
  status?:       string;
}

/** @deprecated Use AdminUser — kept for backward compatibility. */
export type ApiAdmin = AdminUser;

export interface ApiDepartment {
  id:   number;
  name: string;
}

export interface ApiEmployee {
  id:              string;
  employeeNumber?: string;
  name:            string;
  email:           string;
  avatar_url?:     string;
  roles?:          string[];
  roleDetails?:    RoleDetail[];
  permissions?:    string[];
  section?:        string;
  sectionLabel?:   string;
  department?:     ApiDepartment;
  status?:         string;
}

export interface OtpRequiredResponse {
  otpRequired:       true;
  adminId:           string;
  expiresAt:         string;
  magicLinkRequired?: boolean;
}

export interface LoginResponse {
  admin:         AdminUser;
  accessToken:   string;
  tokenType?:    'Bearer';
  redirect_path?: string;
}

export interface AdminLoginApiResponse {
  data: {
    actorType?:          'admin' | 'employee';
    accessToken?:        string;
    access_token?:       string;
    tokenType?:          string;
    admin?:              AdminUser;
    employee?:           ApiEmployee;
    redirect_path?:      string;
    otpRequired?:        boolean;
    otp_required?:       boolean;
    magicLinkRequired?:  boolean;
    magic_link_required?: boolean;
    adminId?:            string;
    admin_id?:           string;
    expiresAt?:          string;
    expires_at?:         string;
  };
}

export interface AdminOtpResendApiResponse {
  data: {
    adminId?:    string;
    admin_id?:   string;
    expiresAt?:  string;
    expires_at?: string;
  };
}

export interface AdminAuthSuccessApiResponse {
  data: {
    accessToken?:   string;
    access_token?:  string;
    admin:          AdminUser;
    redirect_path?: string;
  };
}

/** Profile returns admin fields at `data` root (permissions at `data.permissions`). */
export interface AdminProfileApiResponse {
  data: AdminUser & {
    admin?:       AdminUser;
    permissions?: string[];
  };
}

export interface EmployeeLoginApiResponse {
  status:  string;
  message: string;
  data: {
    accessToken:   string;
    tokenType:     string;
    employee:      ApiEmployee;
    redirect_path: string;
  };
}

export interface AdminInviteApiResponse {
  data: {
    name:          string;
    email:         string;
    exp?:          number;
    accessToken?:  string;
    admin?:        ApiAdmin;
    redirect_path?: string;
  };
}

export interface EmployeeInviteApiResponse {
  data: {
    name:          string;
    email:         string;
    exp?:          number;
    accessToken?:  string;
    employee?:     ApiEmployee;
    redirect_path?: string;
  };
}

export interface EmployeeProfileApiResponse {
  status:  string;
  message: string;
  data: {
    employee: ApiEmployee;
  };
}

export interface ChangePasswordPayload {
  current_password:          string;
  new_password:              string;
  new_password_confirmation: string;
}

export interface ChangePasswordApiResponse {
  status:  string;
  message: string;
}

export interface ForgotPasswordApiResponse {
  status?:  'true' | 'false' | string;
  message?: string;
}

export interface EmployeeForgotPasswordData {
  expiresAt: string;
}

export interface EmployeeForgotPasswordApiResponse {
  status?:  'true' | 'false' | string;
  message?: string;
  data?:    EmployeeForgotPasswordData | null;
}

export interface EmployeeVerifyResetOtpData {
  token: string;
}

export interface EmployeeVerifyResetOtpApiResponse {
  status?:  'true' | 'false' | string;
  message?: string;
  data?:    EmployeeVerifyResetOtpData | null;
}

export interface ForgotPasswordState {
  email:       string;
  expiresAt?:  string;
  resetToken?: string;
}

export interface AdminResetVerifyData {
  actorType:     'admin';
  admin_id:      string;
  user_id:       string;
  email:         string;
  name:          string;
  role:          string;
  roles:         string[];
  roleDetails:   Array<{ name: string; permissions: string[] }>;
  permissions:   string[];
  isSuperAdmin:  boolean;
  redirect_path: string;
}

export interface PasswordResetVerifyApiResponse {
  status?:  'true' | 'false' | string;
  message?: string;
  data:     AdminResetVerifyData & {
    actorType?:    'admin' | 'employee';
    employee_id?:  string;
  };
}

export interface ValidationErrorResponse {
  message: string;
  errors:  Record<string, string[]>;
}

export interface PasswordResetTokenPayload {
  actorType:    'admin' | 'employee';
  actorId:      string;
  email:        string;
  name:         string;
  redirectPath?: string;
}

export interface ResetPasswordPayload {
  token:           string;
  password:        string;
  confirmPassword: string;
  actorType:       'admin' | 'employee';
}
