import { useReducer, useEffect, useCallback, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { AuthContext } from './AuthContext';
import { authService } from '@/modules/auth/services/auth.service';
import type { AuthUser, LoginCredentials, SetPasswordPayload, LoginResult } from '@/modules/auth/types/auth.types';
import { Permission, type Role } from '@/shared/types/role.types';

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

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: Object.values(Permission),
  hr: [
    Permission.ViewEmployees,
    Permission.ManageEmployees,
    Permission.ViewAttendance,
    Permission.ManageAttendance,
    Permission.ViewLeaves,
    Permission.ManageLeaves,
    Permission.ViewPayroll,
    Permission.ManagePayroll,
    Permission.ViewMessages,
    Permission.SendMessages,
  ],
  manager: [
    Permission.ViewEmployees,
    Permission.ViewAttendance,
    Permission.ViewLeaves,
    Permission.ManageLeaves,
    Permission.ViewMessages,
    Permission.SendMessages,
  ],
  'seo-leader': [
    Permission.ViewEmployees,
    Permission.ViewAttendance,
    Permission.ViewLeaves,
    Permission.ManageLeaves,
    Permission.ViewMessages,
    Permission.SendMessages,
  ],
  employee: [
    Permission.ViewAttendance,
    Permission.ViewLeaves,
    Permission.ViewMessages,
    Permission.SendMessages,
  ],
  'seo-member': [
    Permission.ViewAttendance,
    Permission.ViewLeaves,
    Permission.ViewMessages,
    Permission.SendMessages,
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState);

  useEffect(() => {
    dispatch({ type: 'INIT', payload: authService.getStoredUser() });
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
    const { user } = await authService.verifyAdminOtp(adminId, otp, rememberMe);
    flushSync(() => {
      dispatch({ type: 'LOGIN', payload: user });
    });
    return user;
  }, []);

  const completeMagicLogin = useCallback(async (token: string) => {
    const user = await authService.completeMagicLogin(token);
    flushSync(() => {
      dispatch({ type: 'LOGIN', payload: user });
    });
    return user;
  }, []);

  const completeInviteLogin = useCallback((token: string, inviteType: 'admin' | 'employee') => {
    const user = authService.completeInviteLogin(token, inviteType);
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

  const hasPermission = useCallback((permission: Permission) => {
    if (!state.user) return false;
    return ROLE_PERMISSIONS[state.user.role]?.includes(permission) ?? false;
  }, [state.user]);

  return (
    <AuthContext.Provider
      value={{
        user:            state.user,
        isAuthenticated: state.user !== null,
        isLoading:       state.isLoading,
        login,
        verifyOtp,
        completeMagicLogin,
        completeInviteLogin,
        setPassword,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
