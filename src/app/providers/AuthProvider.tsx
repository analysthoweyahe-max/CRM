import { useReducer, useEffect, useCallback, type ReactNode } from 'react';
import { AuthContext } from '@/modules/auth/context/AuthContext';
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
  | { type: 'LOADING' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'LOADING': return { ...state, isLoading: true };
    case 'INIT':    return { user: action.payload, isLoading: false };
    case 'LOGIN':   return { user: action.payload, isLoading: false };
    case 'LOGOUT':  return { user: null,           isLoading: false };
  }
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
  employee: [
    Permission.ViewAttendance,
    Permission.ViewLeaves,
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
  'seo-member': [
    Permission.ViewAttendance,
    Permission.ViewLeaves,
    Permission.ViewMessages,
    Permission.SendMessages,
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { user: null, isLoading: true });

  useEffect(() => {
    authService.loadProfile().then(user => {
      dispatch({ type: 'INIT', payload: user });
    });
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResult> => {
    dispatch({ type: 'LOADING' });
    try {
      const result = await authService.login(credentials);
      if (result.status === 'success') {
        dispatch({ type: 'LOGIN', payload: result.user });
      } else {
        dispatch({ type: 'INIT', payload: state.user });
      }
      return result;
    } catch (error) {
      dispatch({ type: 'INIT', payload: state.user });
      throw error;
    }
  }, [state.user]);

  const verifyOtp = useCallback(async (adminId: string, otp: string, rememberMe = false) => {
    const { user } = await authService.verifyAdminOtp(adminId, otp, rememberMe);
    dispatch({ type: 'LOGIN', payload: user });
    return user;
  }, []);

  const completeMagicLogin = useCallback(async (token: string) => {
    const user = await authService.completeMagicLogin(token);
    dispatch({ type: 'LOGIN', payload: user });
    return user;
  }, []);

  const completeInviteLogin = useCallback((token: string, inviteType: 'admin' | 'employee') => {
    const user = authService.completeInviteLogin(token, inviteType);
    dispatch({ type: 'LOGIN', payload: user });
    return user;
  }, []);

  const setPassword = useCallback(async (payload: SetPasswordPayload) => {
    dispatch({ type: 'LOADING' });
    try {
      const data = await authService.setPassword(payload);
      dispatch({ type: 'LOGIN', payload: data.user });
    } catch (error) {
      dispatch({ type: 'INIT', payload: state.user });
      throw error;
    }
  }, [state.user]);

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
