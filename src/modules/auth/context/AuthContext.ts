import { createContext, useContext } from 'react';
import type { AuthUser, LoginCredentials, SetPasswordPayload } from '@/modules/auth/types/auth.types';
import type { Permission } from '@/shared/types/role.types';

export interface AuthContextValue {
  user:            AuthUser | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  login:           (credentials: LoginCredentials) => Promise<AuthUser>;
  setPassword:     (payload: SetPasswordPayload)   => Promise<void>;
  logout:          () => Promise<void>;
  hasPermission:   (permission: Permission) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
