import { useReducer, useEffect, useCallback, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { AuthContext } from '@/modules/auth/context/AuthContext';
import { authService } from '@/modules/auth/services/auth.service';
import type { AuthUser, LoginCredentials, SetPasswordPayload, LoginResult } from '@/modules/auth/types/auth.types';
import type { ApiAdmin, ApiEmployee } from '@/modules/auth/types/auth.types';
import {
  canAccess,
  canAccessRole,
  hasAnyPermission as checkAnyPermission,
  hasAnyRole as checkAnyRole,
  hasPermission as checkHasPermission,
  isSuperAdminUser,
} from '@/shared/utils/authPermissions.utils';

interface State {
  user:      AuthUser | null;
  isLoading: boolean;
}

type Action =
  | { type: 'INIT';    payload: AuthUser | null }
  | { type: 'LOGIN';   payload: AuthUser }
  | { type: 'LOGOUT' }
  | { type: 'AUTH_FAIL' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INIT':      return { user: action.payload, isLoading: false };
    case 'LOGIN':     return { user: action.payload, isLoading: false };
    case 'LOGOUT':    return { user: null,           isLoading: false };
    case 'AUTH_FAIL': return { ...state, isLoading: false };
    default:          return state;
  }
}

function getInitialState(): State {
  return {
    user:      authService.getStoredUser(),
    isLoading: true,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  useEffect(() => {
    let cancelled = false;

    authService.loadProfile()
      .then((user) => {
        if (!cancelled) dispatch({ type: 'INIT', payload: user });
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'INIT', payload: authService.getStoredUser() });
      });

    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    try {
      const result = await authService.login(credentials);
      if (result.status === 'success') {
        flushSync(() => {
          dispatch({ type: 'LOGIN', payload: result.user });
        });
      } else {
        dispatch({ type: 'AUTH_FAIL' });
      }
      return result;
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL' });
      throw error;
    }
  }, []);

  const verifyOtp = useCallback(async (adminId: string, otp: string, rememberMe = false) => {
    const { user, redirectPath } = await authService.verifyAdminOtp(adminId, otp, rememberMe);
    flushSync(() => {
      dispatch({ type: 'LOGIN', payload: user });
    });
    return { user, redirectPath };
  }, []);

  const completeMagicLogin = useCallback(async (token: string) => {
    const user = await authService.completeMagicLogin(token);
    flushSync(() => {
      dispatch({ type: 'LOGIN', payload: user });
    });
    return user;
  }, []);

  const completeInviteLogin = useCallback(async (
    token: string,
    inviteType: 'admin' | 'employee',
    profile?: ApiAdmin | ApiEmployee,
  ) => {
    const user = await authService.completeInviteLogin(token, inviteType, profile);
    flushSync(() => {
      dispatch({ type: 'LOGIN', payload: user });
    });
    return user;
  }, []);

  const setPassword = useCallback(async (payload: SetPasswordPayload) => {
    try {
      const data = await authService.setPassword(payload);
      flushSync(() => {
        dispatch({ type: 'LOGIN', payload: data.user });
      });
    } catch (error) {
      dispatch({ type: 'AUTH_FAIL' });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const fresh = await authService.loadProfile();
    if (fresh) {
      dispatch({ type: 'LOGIN', payload: fresh });
    }
    return fresh;
  }, []);

  const can = useCallback((permission: string | string[], match: 'any' | 'all' = 'any') => {
    if (!state.user) return false;
    const superAdmin = isSuperAdminUser(state.user);
    return canAccess(state.user.permissions, state.user.roles, permission, match, superAdmin);
  }, [state.user]);

  const hasRole = useCallback((role: string | string[]) => {
    if (!state.user) return false;
    const superAdmin = isSuperAdminUser(state.user);
    return canAccessRole(state.user.roles, role, superAdmin);
  }, [state.user]);

  const hasAnyRole = useCallback((roles: string[]) => {
    if (!state.user) return false;
    if (isSuperAdminUser(state.user)) return true;
    return checkAnyRole(state.user.roles, roles);
  }, [state.user]);

  const hasAnyPermission = useCallback((permissions: string[]) => {
    if (!state.user) return false;
    if (isSuperAdminUser(state.user)) return true;
    return checkAnyPermission(state.user.permissions, permissions);
  }, [state.user]);

  const isSuperAdmin = isSuperAdminUser(state.user);
  const token = authService.getStoredToken();
  const userType = state.user?.actor ?? null;

  const hasPermission = useCallback(
    (permission: string) => checkHasPermission(state.user, permission),
    [state.user],
  );

  return (
    <AuthContext.Provider
      value={{
        user:            state.user,
        userType,
        token,
        isAuthenticated: state.user !== null,
        isLoading:       state.isLoading,
        login,
        verifyOtp,
        completeMagicLogin,
        completeInviteLogin,
        setPassword,
        logout,
        can,
        hasRole,
        hasAnyRole,
        hasAnyPermission,
        hasPermission,
        isSuperAdmin,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
