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

function b64Encode(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/gi, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    ),
  );
}

function b64Decode(b64: string): string {
  return decodeURIComponent(
    atob(b64)
      .split('')
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join(''),
  );
}

function decodeUser(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(b64Decode(token.split('.')[1])) as Record<string, unknown>;
    return {
      id:         String(payload['sub']        ?? ''),
      employeeId: String(payload['employeeId'] ?? ''),
      fullName:   String(payload['fullName']   ?? ''),
      role:       payload['role'] as AuthUser['role'],
      avatarUrl:  payload['avatarUrl'] as string | undefined,
    };
  } catch {
    return null;
  }
}

function buildMockToken(user: AuthUser): string {
  const payloadB64 = b64Encode(JSON.stringify({
    sub:        user.id,
    employeeId: user.employeeId,
    fullName:   user.fullName,
    role:       user.role,
    exp:        Math.floor(Date.now() / 1000) + 86_400,
  }));

  return `eyJhbGciOiJIUzI1NiJ9.${payloadB64}.dev`;
}

function buildDevMockResponse(employeeId: string, rememberMe: boolean): AuthLoginResponse {
  const mockUser: AuthUser = {
    id: '1',
    employeeId,
    fullName: 'نور أحمد',
    role: 'admin',
  };
  const mockToken = buildMockToken(mockUser);
  storeToken(mockToken, rememberMe);
  return { token: mockToken, user: mockUser };
}

async function login(credentials: LoginCredentials): Promise<AuthLoginResponse> {
  if (env.isDev) return buildDevMockResponse(credentials.employeeId, credentials.rememberMe ?? false);
  const { data } = await authApi.login(credentials);
  storeToken(data.token, credentials.rememberMe ?? false);
  return data;
}

async function setPassword(payload: SetPasswordPayload): Promise<AuthLoginResponse> {
  if (env.isDev) return buildDevMockResponse('EMP-DEV-001', payload.rememberMe ?? false);
  const { data } = await authApi.setPassword(payload);
  storeToken(data.token, payload.rememberMe ?? false);
  return data;
}

async function validateInvite(token: string): Promise<InviteTokenPayload> {
  if (env.isDev) {
    return {
      employeeId: token || 'EMP-DEV-001',
      fullName: 'موظف تجريبي',
      exp: Math.floor(Date.now() / 1000) + 86_400,
    };
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
