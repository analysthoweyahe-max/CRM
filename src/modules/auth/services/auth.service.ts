import { authApi } from '@/modules/auth/api/auth.api';
import type {
  LoginCredentials,
  SetPasswordPayload,
  AuthLoginResponse,
  AuthUser,
  InviteTokenPayload,
} from '@/modules/auth/types/auth.types';
import type { Role } from '@/shared/types/role.types';
import { TOKEN_KEY, USER_KEY, REFRESH_TOKEN_KEY, REMEMBER_ME_KEY } from '@/app/config/constants';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

function mapAdminRole(roles: string[]): Role {
  if (roles.includes('hr-manager')) return 'hr';
  if (roles.includes('manager'))    return 'manager';
  return 'admin';
}

// ── Storage ──────────────────────────────────────────────────────────────────

function storeAuth(token: string, user: AuthUser, rememberMe: boolean): void {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
}

function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(REMEMBER_ME_KEY);
}

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
}

function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY) ?? sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuthUser; }
  catch { return null; }
}

// ── Auth operations ───────────────────────────────────────────────────────────

async function login(credentials: LoginCredentials): Promise<AuthLoginResponse> {
  const { employeeId, password, rememberMe = false } = credentials;

  if (isEmail(employeeId)) {
    const { data } = await authApi.employeeLogin({ email: employeeId, password });
    const { accessToken, employee } = data.data;
    const user: AuthUser = {
      id:         employee.id,
      employeeId: employee.id,
      fullName:   employee.name,
      role:       'employee',
      avatarUrl:  employee.avatar_url,
    };
    storeAuth(accessToken, user, rememberMe);
    return { token: accessToken, user };
  } else {
    const { data } = await authApi.adminLogin({ admin_id: employeeId, password });
    const { accessToken, admin } = data.data;
    const user: AuthUser = {
      id:         admin.id,
      employeeId: admin.id,
      fullName:   admin.name,
      role:       mapAdminRole(admin.roles ?? []),
      avatarUrl:  admin.avatar_url,
    };
    storeAuth(accessToken, user, rememberMe);
    return { token: accessToken, user };
  }
}

async function setPassword(payload: SetPasswordPayload): Promise<AuthLoginResponse> {
  const { token, password, confirmPassword, rememberMe = false, inviteType = 'employee' } = payload;
  const apiPayload = { password, password_confirmation: confirmPassword };

  if (inviteType === 'admin') {
    const { data } = await authApi.setAdminPassword(token, apiPayload);
    const { accessToken, admin } = data.data;
    const user: AuthUser = {
      id:         admin.id,
      employeeId: admin.id,
      fullName:   admin.name,
      role:       mapAdminRole(admin.roles ?? []),
      avatarUrl:  admin.avatar_url,
    };
    storeAuth(accessToken, user, rememberMe);
    return { token: accessToken, user };
  } else {
    const { data } = await authApi.setEmployeePassword(token, apiPayload);
    const { accessToken, employee } = data.data;
    const user: AuthUser = {
      id:         employee.id,
      employeeId: employee.id,
      fullName:   employee.name,
      role:       'employee',
      avatarUrl:  employee.avatar_url,
    };
    storeAuth(accessToken, user, rememberMe);
    return { token: accessToken, user };
  }
}

async function validateInvite(token: string): Promise<InviteTokenPayload> {
  // Try employee invite first; fall back to admin invite
  try {
    const { data } = await authApi.verifyEmployeeInvite(token);
    return {
      name:       data.data.name,
      email:      data.data.email,
      exp:        data.data.exp ?? 0,
      inviteType: 'employee',
    };
  } catch {
    const { data } = await authApi.verifyAdminInvite(token);
    return {
      name:       data.data.name,
      email:      data.data.email,
      exp:        data.data.exp ?? 0,
      inviteType: 'admin',
    };
  }
}

async function logout(): Promise<void> {
  const user = getStoredUser();
  try {
    if (user?.role === 'employee') {
      await authApi.employeeLogout();
    } else {
      await authApi.adminLogout();
    }
  } finally {
    clearAuth();
  }
}

export const authService = {
  login,
  setPassword,
  validateInvite,
  logout,
  getStoredToken,
  getStoredUser,
  clearAuth,
};
