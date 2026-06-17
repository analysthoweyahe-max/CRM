import { authApi } from '@/features/auth/api/auth.api';
import type {
  LoginCredentials,
  SetPasswordPayload,
  AuthLoginResponse,
  AuthUser,
  InviteTokenPayload,
} from '@/features/auth/types/auth.types';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, REMEMBER_ME_KEY } from '@/app/config/constants';
import { env } from '@/app/config/env';

function storeToken(token: string, rememberMe: boolean): void {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
}

function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
}

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

function decodeUser(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as Record<string, unknown>;
    return {
      id:         String(payload['sub'] ?? ''),
      employeeId: String(payload['employeeId'] ?? ''),
      fullName:   String(payload['fullName'] ?? ''),
      role:       payload['role'] as AuthUser['role'],
      avatarUrl:  payload['avatarUrl'] as string | undefined,
    };
  } catch {
    return null;
  }
}

function buildDevMockResponse(credentials: LoginCredentials): AuthLoginResponse {
  const mockUser: AuthUser = {
    id:         '1',
    employeeId: credentials.employeeId,
    fullName:   'مستخدم تجريبي',
    role:       'admin',
  };
  const payloadB64 = btoa(JSON.stringify({
    sub:        mockUser.id,
    employeeId: mockUser.employeeId,
    fullName:   mockUser.fullName,
    role:       mockUser.role,
    exp:        Math.floor(Date.now() / 1000) + 86_400,
  }));
  // Format: header.payload.sig — compatible with decodeUser()
  const mockToken = `eyJhbGciOiJIUzI1NiJ9.${payloadB64}.dev`;
  storeToken(mockToken, credentials.rememberMe ?? false);
  return { token: mockToken, user: mockUser };
}

async function login(credentials: LoginCredentials): Promise<AuthLoginResponse> {
  if (env.isDev) return buildDevMockResponse(credentials);
  const { data } = await authApi.login(credentials);
  storeToken(data.token, credentials.rememberMe ?? false);
  return data;
}

async function setPassword(payload: SetPasswordPayload): Promise<AuthLoginResponse> {
  if (env.isDev) {
    const mockUser: AuthUser = {
      id:         '1',
      employeeId: 'EMP-DEV-001',
      fullName:   'مستخدم تجريبي',
      role:       'admin',
    };
    const payloadB64 = btoa(JSON.stringify({
      sub: mockUser.id, employeeId: mockUser.employeeId,
      fullName: mockUser.fullName, role: mockUser.role,
      exp: Math.floor(Date.now() / 1000) + 86_400,
    }));
    const mockToken = `eyJhbGciOiJIUzI1NiJ9.${payloadB64}.dev`;
    storeToken(mockToken, false);
    return { token: mockToken, user: mockUser };
  }
  const { data } = await authApi.setPassword(payload);
  storeToken(data.token, false);
  return data;
}

async function validateInvite(token: string): Promise<InviteTokenPayload> {
  if (env.isDev) {
    return { employeeId: token || 'EMP-DEV-001', fullName: 'موظف تجريبي', exp: Math.floor(Date.now() / 1000) + 86_400 };
  }
  const { data } = await authApi.validateInvite(token);
  return data;
}

async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } finally {
    clearToken();
  }
}

export const authService = {
  login,
  setPassword,
  validateInvite,
  logout,
  getStoredToken,
  decodeUser,
  clearToken,
};
