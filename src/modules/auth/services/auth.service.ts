import { authApi } from '@/modules/auth/api/auth.api';
import type {
  LoginCredentials,
  SetPasswordPayload,
  AuthLoginResponse,
  AuthUser,
  ApiEmployee,
  InviteTokenPayload,
} from '@/modules/auth/types/auth.types';
import type { Role } from '@/shared/types/role.types';
import { TOKEN_KEY, USER_KEY, REFRESH_TOKEN_KEY, REMEMBER_ME_KEY } from '@/app/config/constants';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

function mapAdminRole(roles: string[]): Role {
  if (roles.includes('hr-manager'))       return 'hr';
  if (roles.includes('manager'))          return 'manager';
  if (roles.includes('project-manager'))  return 'manager';
  if (roles.includes('seo-manager'))      return 'seo-leader';
  return 'admin';
}

function mapEmployeeRole(roles: string[], department?: { id: number; name: string }): Role {
  if (roles?.includes('seo-employee'))  return 'seo-member';
  if (department?.name?.toLowerCase() === 'seo') return 'seo-member';
  return 'employee';
}

function buildEmployeeUser(employee: ApiEmployee): AuthUser {
  return {
    id:         employee.id,
    employeeId: employee.id,
    fullName:   employee.name,
    role:       mapEmployeeRole(employee.roles ?? [], employee.department),
    avatarUrl:  employee.avatar_url,
  };
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
  const { password, rememberMe = false } = credentials;
  const employeeId = credentials.employeeId.trim();

  if (isEmail(employeeId)) {
    const { data } = await authApi.employeeLogin({ email: employeeId, password });
    const { accessToken, employee } = data.data;
    const user = buildEmployeeUser(employee);
    storeAuth(accessToken, user, rememberMe);
    return { token: accessToken, user };
  }

  // Non-email input: try employee login first (handles numeric IDs like "783729")
  // then fall back to admin login (for HR/manager/seo-leader UUIDs)
  try {
    const { data } = await authApi.employeeLogin({ employee_id: employeeId, password });
    const { accessToken, employee } = data.data;
    const user = buildEmployeeUser(employee);
    storeAuth(accessToken, user, rememberMe);
    return { token: accessToken, user };
  } catch {
    const { data } = await authApi.adminLogin({ admin_id: employeeId, password });
    const payload = data.data;
    if (!payload?.accessToken || !payload?.admin) {
      throw new Error('Invalid admin login response');
    }
    const { accessToken, admin } = payload;
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
    const user = buildEmployeeUser(employee);
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

async function loadProfile(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  const storedUser = getStoredUser();
  if (!storedUser) return null;

  try {
    if (storedUser.role === 'employee' || storedUser.role === 'seo-member') {
      const { data } = await authApi.employeeProfile();
      const { employee } = data.data;
      const user = buildEmployeeUser(employee);
      const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
      storage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    }
    return storedUser;
  } catch {
    clearAuth();
    return null;
  }
}

async function logout(): Promise<void> {
  const user = getStoredUser();
  try {
    if (user?.role === 'employee' || user?.role === 'seo-member') {
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
  loadProfile,
  logout,
  getStoredToken,
  getStoredUser,
  clearAuth,
};
