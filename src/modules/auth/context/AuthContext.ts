import { createContext, useContext } from 'react';
import type { AuthUser, LoginCredentials, SetPasswordPayload, LoginResult, ApiAdmin, ApiEmployee } from '@/modules/auth/types/auth.types';

export interface AuthContextValue {
  user:               AuthUser | null;
  userType:           'admin' | 'employee' | null;
  token:              string | null;
  isAuthenticated:    boolean;
  isLoading:          boolean;
  login:              (credentials: LoginCredentials) => Promise<LoginResult>;
  verifyOtp:          (adminId: string, otp: string, rememberMe?: boolean) => Promise<{ user: AuthUser; redirectPath?: string }>;
  completeMagicLogin: (token: string) => Promise<AuthUser>;
  completeInviteLogin: (
    token: string,
    inviteType: 'admin' | 'employee',
    profile?: ApiAdmin | ApiEmployee,
  ) => Promise<AuthUser>;
  setPassword:        (payload: SetPasswordPayload) => Promise<void>;
  logout:             () => Promise<void>;
  /** Backend permission slug check (super-admin bypasses). */
  can:                (permission: string | string[], match?: 'any' | 'all') => boolean;
  hasRole:            (role: string | string[]) => boolean;
  hasAnyRole:         (roles: string[]) => boolean;
  hasAnyPermission:   (permissions: string[]) => boolean;
  /** Flat permissions array check — super-admin always allowed. */
  hasPermission:      (permission: string) => boolean;
  /** True for super-admin only (backend flag or role slug). */
  isSuperAdmin:       boolean;
  /** Re-fetch profile from the API (e.g. after role/permission changes). */
  refreshUser:        () => Promise<AuthUser | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
