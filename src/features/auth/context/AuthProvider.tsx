import { useReducer, useEffect, useCallback, type ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { authService } from '@/features/auth/services/auth.service';
import type { AuthUser, LoginCredentials, SetPasswordPayload } from '@/features/auth/types/auth.types';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { user: null, isLoading: true });

  useEffect(() => {
    const token = authService.getStoredToken();
    const user  = token ? authService.decodeUser(token) : null;
    dispatch({ type: 'INIT', payload: user });
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOADING' });
    const data = await authService.login(credentials);
    dispatch({ type: 'LOGIN', payload: data.user });
  }, []);

  const setPassword = useCallback(async (payload: SetPasswordPayload) => {
    dispatch({ type: 'LOADING' });
    const data = await authService.setPassword(payload);
    dispatch({ type: 'LOGIN', payload: data.user });
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user:            state.user,
        isAuthenticated: state.user !== null,
        isLoading:       state.isLoading,
        login,
        setPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
