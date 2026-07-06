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
import { TOKEN_KEY, USER_KEY, REFRESH_TOKEN_KEY, REMEMBER_ME_KEY, ACCOUNT_TYPE_KEY } from '@/app/config/constants';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(value: string): boolean {
  return EMAIL_RE.test(value);
}

type AccountType = 'employee' | 'admin';

function getCachedAccountType(identifier: string): AccountType | null {
  const value = localStorage.getItem(ACCOUNT_TYPE_KEY + identifier);
  return value === 'employee' || value === 'admin' ? value : null;
}

function setCachedAccountType(identifier: string, type: AccountType): void {
  localStorage.setItem(ACCOUNT_TYPE_KEY + identifier, type);
}

/* Confirmed shape for "wrong account type" (e.g. an employee ID tried against
   the admin endpoint): 422 with `errors.<id_field>: ["The selected <id_field>
   is invalid."]`. Any other failure (wrong password, network error, etc.)
   must NOT trigger a second login attempt against the other endpoint — that
   was needlessly doubling failed-login load on the server. */
function isWrongAccountTypeError(err: unknown, idField: string): boolean {
  const resp = (err as { response?: { status?: number; data?: { errors?: Record<string, string[]> } } })?.response;
  if (resp?.status !== 422) return false;
  const fieldErrors = resp.data?.errors?.[idField];
  return Array.isArray(fieldErrors) && fieldErrors.some((msg) => /is invalid/i.test(msg));
}

function mapAdminRole(roles: string[]): Role {
  if (roles.includes('super-admin'))      return 'admin';
  if (roles.includes('hr-manager'))       return 'hr';
  if (roles.includes('manager'))          return 'manager';
  if (roles.includes('project-manager'))  return 'manager';
  if (roles.includes('seo-manager'))      return 'seo-leader';
  return 'admin';
}

function mapEmployeeRole(roles: string[]): Role {
  if (roles?.includes('seo-employee') || roles?.includes('seo-member')) return 'seo-member';
  return 'employee';
}

function buildEmployeeUser(employee: ApiEmployee): AuthUser {
  return {
    id:         employee.id,
    employeeId: employee.id,
    fullName:   employee.name,
    role:       mapEmployeeRole(employee.roles ?? []),
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

async function loginAsEmployee(
  employeeId: string,
  password: string,
  rememberMe: boolean,
): Promise<AuthLoginResponse> {
  const employeePayload = isEmail(employeeId)
    ? { email: employeeId, password }
    : { employee_id: employeeId, password };
  const { data } = await authApi.employeeLogin(employeePayload);
  const { accessToken, employee } = data.data;
  const user = buildEmployeeUser(employee);
  storeAuth(accessToken, user, rememberMe);
  setCachedAccountType(employeeId, 'employee');
  return { token: accessToken, user };
}

async function loginAsAdmin(
  employeeId: string,
  password: string,
  rememberMe: boolean,
): Promise<AuthLoginResponse> {
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
  setCachedAccountType(employeeId, 'admin');
  return { token: accessToken, user };
}

async function login(credentials: LoginCredentials): Promise<AuthLoginResponse> {
  const { password, rememberMe = false } = credentials;
  const employeeId = credentials.employeeId.trim();
  const cachedType = getCachedAccountType(employeeId);
  const employeeIdField = isEmail(employeeId) ? 'email' : 'employee_id';

  // Try the account type we last succeeded with (if any) first, so returning
  // users don't hit the wrong login endpoint and see a spurious 422 every time.
  // Only fall back to the other endpoint when the error confirms this identifier
  // belongs to the other account type — not for wrong passwords or other errors,
  // which would otherwise double every failed login attempt against the server.
  if (cachedType === 'admin') {
    try {
      return await loginAsAdmin(employeeId, password, rememberMe);
    } catch (err) {
      if (!isWrongAccountTypeError(err, 'admin_id')) throw err;
      return await loginAsEmployee(employeeId, password, rememberMe);
    }
  }

  try {
    return await loginAsEmployee(employeeId, password, rememberMe);
  } catch (err) {
    if (!isWrongAccountTypeError(err, employeeIdField)) throw err;
    return await loginAsAdmin(employeeId, password, rememberMe);
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
