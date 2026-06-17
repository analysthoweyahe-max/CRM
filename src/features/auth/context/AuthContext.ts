import { createContext, useContext } from 'react';
import type { AuthUser, LoginCredentials, SetPasswordPayload } from '@/features/auth/types/auth.types';

export interface AuthContextValue {
  user:            AuthUser | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  login:           (credentials: LoginCredentials) => Promise<void>;
  setPassword:     (payload: SetPasswordPayload)   => Promise<void>;
  logout:          () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
