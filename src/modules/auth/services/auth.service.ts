import { authApi } from '@/modules/auth/api/auth.api';
import type {
  LoginCredentials,
  SetPasswordPayload,
  AuthLoginResponse,
  AuthUser,
  ApiEmployee,
  ApiAdmin,
  InviteTokenPayload,
  LoginResult,
  AuthActor,
  PasswordResetTokenPayload,
  ResetPasswordPayload,
  RoleDetail,
} from '@/modules/auth/types/auth.types';
import { mapRolesToAppRole } from '@/shared/types/role.types';
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

/** 422 with `errors.<id_field>: ["The selected <id_field> is invalid."]` — wrong guard, not wrong password. */
function isWrongAccountTypeError(err: unknown, idField: string): boolean {
  const resp = (err as { response?: { status?: number; data?: { errors?: Record<string, string[]> } } })?.response;
  if (resp?.status !== 422) return false;
  const fieldErrors = resp.data?.errors?.[idField];
  return Array.isArray(fieldErrors) && fieldErrors.some((msg) => /is invalid/i.test(msg));
}

/** Backend may return permission slugs as strings or `{ name: string }` objects. */
function permissionSlug(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'name' in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === 'string' ? name : null;
  }
  return null;
}

function normalizePermissionSlugs(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(permissionSlug).filter((slug): slug is string => !!slug);
}

function normalizeRoleDetails(raw: unknown): RoleDetail[] | undefined {
  if (!Array.isArray(raw) || raw.length === 0) return undefined;

  const details = raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const r = item as Record<string, unknown>;
      const name = String(r.name ?? r.slug ?? '').trim();
      if (!name) return null;
      return { name, permissions: normalizePermissionSlugs(r.permissions) };
    })
    .filter((d): d is RoleDetail => d !== null);

  return details.length > 0 ? details : undefined;
}

function mergeEffectivePermissions(flat: string[], roleDetails?: RoleDetail[]): string[] {
  const merged = new Set(flat);
  for (const detail of roleDetails ?? []) {
    for (const perm of detail.permissions) merged.add(perm);
  }
  return [...merged];
}

/** Backend may return role slugs as strings or `{ name, permissions }` objects. */
function normalizeRolesField(raw: unknown): { slugs: string[]; details: RoleDetail[] } {
  if (!Array.isArray(raw)) return { slugs: [], details: [] };

  const slugs: string[] = [];
  const details: RoleDetail[] = [];

  for (const item of raw) {
    if (typeof item === 'string') {
      slugs.push(item);
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const r = item as Record<string, unknown>;
    const name = String(r.name ?? r.slug ?? '').trim();
    if (!name) continue;
    slugs.push(name);
    details.push({ name, permissions: normalizePermissionSlugs(r.permissions) });
  }

  return { slugs, details };
}

function collectPermissionSources(extra: Record<string, unknown>): string[] {
  return normalizePermissionSlugs(
    extra.permissions ?? extra.all_permissions ?? extra.allPermissions,
  );
}

function normalizeApiAdmin(raw: ApiAdmin): ApiAdmin {
  const extra = raw as ApiAdmin & Record<string, unknown>;
  const { slugs, details: roleObjectDetails } = normalizeRolesField(extra.roles);
  const explicitDetails = normalizeRoleDetails(extra.roleDetails ?? extra.role_details);
  const roleDetails = explicitDetails
    ?? (roleObjectDetails.length > 0 ? roleObjectDetails : undefined);
  // Admin UI checks the flat permissions array from the backend — not roleDetails.
  const permissions = collectPermissionSources(extra);

  return {
    ...raw,
    roles:        slugs.length > 0 ? slugs : (raw.roles ?? []),
    permissions,
    roleDetails,
    isSuperAdmin: raw.isSuperAdmin ?? extra.is_super_admin === true,
  };
}

function normalizeApiEmployee(raw: ApiEmployee): ApiEmployee {
  const extra = raw as ApiEmployee & Record<string, unknown>;
  const { slugs, details: roleObjectDetails } = normalizeRolesField(extra.roles);
  const explicitDetails = normalizeRoleDetails(extra.roleDetails ?? extra.role_details);
  const roleDetails = explicitDetails
    ?? (roleObjectDetails.length > 0 ? roleObjectDetails : undefined);
  const permissions = mergeEffectivePermissions(
    collectPermissionSources(extra),
    roleDetails,
  );

  return {
    ...raw,
    roles:        slugs.length > 0 ? slugs : (raw.roles ?? []),
    permissions,
    roleDetails,
    sectionLabel: raw.sectionLabel ?? (typeof extra.section_label === 'string' ? extra.section_label : undefined),
  };
}

function buildEmployeeUser(raw: ApiEmployee): AuthUser {
  const employee = normalizeApiEmployee(raw);
  return {
    id:           employee.id,
    employeeId:   employee.id,
    fullName:     employee.name,
    email:        employee.email,
    role:         mapRolesToAppRole(employee.roles, 'employee'),
    roles:        employee.roles ?? [],
    permissions:  employee.permissions ?? [],
    roleDetails:  employee.roleDetails,
    section:      employee.section,
    sectionLabel: employee.sectionLabel,
    actor:        'employee',
    avatarUrl:    employee.avatar_url,
  };
}

function buildAdminUser(raw: ApiAdmin): AuthUser {
  const admin = normalizeApiAdmin(raw);
  const isSuperAdmin = admin.isSuperAdmin ?? admin.roles?.includes('super-admin') ?? false;
  return {
    id:           admin.id,
    employeeId:   admin.id,
    fullName:     admin.name,
    email:        admin.email,
    role:         mapRolesToAppRole(admin.roles, 'admin'),
    roles:        admin.roles ?? [],
    permissions:  admin.permissions ?? [],
    roleDetails:  admin.roleDetails,
    isSuperAdmin,
    actor:        'admin',
    avatarUrl:    admin.avatar_url,
  };
}

/** Back-fill roles/permissions for sessions stored before this feature shipped. */
function normalizeStoredUser(raw: AuthUser): AuthUser {
  const roleField = normalizeRolesField(raw.roles);
  const roles = roleField.slugs.length
    ? roleField.slugs
    : raw.role === 'admin'
      ? ['super-admin']
      : [];

  const roleDetails = normalizeRoleDetails(raw.roleDetails)
    ?? (roleField.details.length > 0 ? roleField.details : undefined);
  const permissions = raw.actor === 'admin'
    ? normalizePermissionSlugs(raw.permissions)
    : mergeEffectivePermissions(normalizePermissionSlugs(raw.permissions), roleDetails);

  return {
    ...raw,
    roles,
    permissions,
    roleDetails,
    actor: raw.actor ?? (raw.role === 'employee' || raw.role === 'seo-member' ? 'employee' : 'admin'),
  };
}

function parseAdminProfilePayload(data: unknown): ApiAdmin {
  const record = data as Record<string, unknown>;
  const nested = record.admin && typeof record.admin === 'object'
    ? record.admin as Record<string, unknown>
    : null;

  const base = { ...(nested ?? record) } as ApiAdmin & Record<string, unknown>;

  // Profile: permissions live at `data.permissions` (root), not inside nested admin.
  const rootPermissions = record.permissions ?? record.all_permissions ?? record.allPermissions;
  if (rootPermissions !== undefined) {
    base.permissions = normalizePermissionSlugs(rootPermissions);
  }

  const rootRoles = record.roles;
  if (rootRoles !== undefined && !nested) {
    const { slugs } = normalizeRolesField(rootRoles);
    if (slugs.length > 0) base.roles = slugs;
  }

  const rootRoleDetails = record.roleDetails ?? record.role_details;
  if (rootRoleDetails !== undefined && !base.roleDetails) {
    base.roleDetails = normalizeRoleDetails(rootRoleDetails);
  }

  if (record.isSuperAdmin !== undefined || record.is_super_admin !== undefined) {
    base.isSuperAdmin = record.isSuperAdmin === true || record.is_super_admin === true;
  }

  return base;
}

function readAccessToken(payload: Record<string, unknown>): string | undefined {
  const token = payload.accessToken ?? payload.access_token;
  return typeof token === 'string' ? token : undefined;
}

function readOtpChallenge(payload: Record<string, unknown>, fallbackAdminId: string) {
  const otpRequired = payload.otpRequired === true || payload.otp_required === true;
  const magicLinkRequired = payload.magicLinkRequired === true || payload.magic_link_required === true;
  const adminId = String(payload.adminId ?? payload.admin_id ?? fallbackAdminId).trim();
  const expiresAt = String(payload.expiresAt ?? payload.expires_at ?? '');
  return { otpRequired, magicLinkRequired, adminId, expiresAt };
}

function readAdminAuthSuccess(data: Record<string, unknown>) {
  const accessToken = readAccessToken(data);
  const admin = data.admin as ApiAdmin | undefined;
  const redirect_path = typeof data.redirect_path === 'string' ? data.redirect_path : undefined;
  return { accessToken, admin, redirect_path };
}

function isRememberMe(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'true';
}

// ── Storage ──────────────────────────────────────────────────────────────────

function storeAuth(token: string, user: AuthUser, rememberMe: boolean): void {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  storage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(REMEMBER_ME_KEY, String(rememberMe));
}

function updateStoredUser(user: AuthUser): void {
  const storage = isRememberMe() ? localStorage : sessionStorage;
  storage.setItem(USER_KEY, JSON.stringify(user));
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
  try { return normalizeStoredUser(JSON.parse(raw) as AuthUser); }
  catch { return null; }
}

async function fetchProfile(actor: AuthActor): Promise<AuthUser> {
  if (actor === 'employee') {
    const { data } = await authApi.employeeProfile();
    return buildEmployeeUser(data.data.employee);
  }
  const { data } = await authApi.adminProfile();
  return buildAdminUser(parseAdminProfilePayload(data.data));
}

// ── Auth operations ───────────────────────────────────────────────────────────

async function loginAsEmployee(
  identifier: string,
  password: string,
  rememberMe: boolean,
): Promise<LoginResult> {
  const employeePayload = isEmail(identifier)
    ? { email: identifier, password }
    : { employee_id: identifier, password };
  const { data } = await authApi.employeeLogin(employeePayload);
  const { accessToken, employee, redirect_path } = data.data;
  const user = buildEmployeeUser(employee);
  storeAuth(accessToken, user, rememberMe);
  setCachedAccountType(identifier, 'employee');
  return {
    status:       'success',
    token:        accessToken,
    user,
    redirectPath: redirect_path,
  };
}

async function loginAsAdmin(
  identifier: string,
  password: string,
  rememberMe: boolean,
): Promise<LoginResult> {
  const { data } = await authApi.adminLogin({ admin_id: identifier, password });
  const payload = data.data as Record<string, unknown>;

  const challenge = readOtpChallenge(payload, identifier);
  if (challenge.otpRequired || challenge.magicLinkRequired) {
    setCachedAccountType(identifier, 'admin');
    return {
      status:            'otp_required',
      adminId:           challenge.adminId,
      expiresAt:         challenge.expiresAt,
      magicLinkRequired: challenge.magicLinkRequired,
    };
  }

  const { accessToken, admin, redirect_path } = readAdminAuthSuccess(payload);
  if (!accessToken || !admin) {
    throw new Error('Invalid admin login response');
  }

  const user = buildAdminUser(admin);
  storeAuth(accessToken, user, rememberMe);
  setCachedAccountType(identifier, 'admin');
  return {
    status:       'success',
    token:        accessToken,
    user,
    redirectPath: redirect_path,
  };
}

async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const { password, rememberMe = false } = credentials;
  const identifier = credentials.adminId.trim();
  const cachedType = getCachedAccountType(identifier);
  const employeeIdField = isEmail(identifier) ? 'email' : 'employee_id';

  if (cachedType === 'admin') {
    try {
      return await loginAsAdmin(identifier, password, rememberMe);
    } catch (err) {
      if (!isWrongAccountTypeError(err, 'admin_id')) throw err;
      return await loginAsEmployee(identifier, password, rememberMe);
    }
  }

  try {
    return await loginAsEmployee(identifier, password, rememberMe);
  } catch (err) {
    if (!isWrongAccountTypeError(err, employeeIdField)) throw err;
    return await loginAsAdmin(identifier, password, rememberMe);
  }
}

async function verifyAdminOtp(adminId: string, otp: string, rememberMe = false): Promise<AuthLoginResponse> {
  const { data } = await authApi.adminVerifyOtp({ admin_id: adminId, code: otp });
  const { accessToken, admin, redirect_path } = readAdminAuthSuccess(data.data as Record<string, unknown>);
  if (!accessToken || !admin) {
    throw new Error('Invalid OTP verification response');
  }
  const user = buildAdminUser(admin);
  storeAuth(accessToken, user, rememberMe);
  setCachedAccountType(adminId, 'admin');
  return { token: accessToken, user, redirectPath: redirect_path };
}

async function resendAdminOtp(adminId: string): Promise<string> {
  const { data } = await authApi.adminResendOtp({ admin_id: adminId });
  const payload = data.data as Record<string, unknown>;
  return String(payload.expiresAt ?? payload.expires_at ?? '');
}

async function completeMagicLogin(token: string, rememberMe = true): Promise<AuthUser> {
  const { data } = await authApi.adminMagicLogin(token);
  const { accessToken, admin } = readAdminAuthSuccess(data.data as Record<string, unknown>);
  if (!accessToken || !admin) {
    throw new Error('Invalid magic login response');
  }
  const user = buildAdminUser(admin);
  storeAuth(accessToken, user, rememberMe);
  return user;
}

async function activateInvite(payload: SetPasswordPayload): Promise<void> {
  const { token, password, confirmPassword, inviteType = 'employee' } = payload;
  const apiPayload = { password, password_confirmation: confirmPassword };

  if (inviteType === 'admin') {
    await authApi.setAdminPassword(token, apiPayload);
  } else {
    await authApi.setEmployeePassword(token, apiPayload);
  }
}

async function setPassword(payload: SetPasswordPayload): Promise<AuthLoginResponse> {
  const { token, password, confirmPassword, rememberMe = false, inviteType = 'employee' } = payload;
  const apiPayload = { password, password_confirmation: confirmPassword };

  if (inviteType === 'admin') {
    const { data } = await authApi.setAdminPassword(token, apiPayload);
    const { accessToken, admin, redirect_path } = readAdminAuthSuccess(data.data as Record<string, unknown>);
    if (!accessToken || !admin) {
      throw new Error('Invalid set-password response');
    }
    const user = buildAdminUser(admin);
    storeAuth(accessToken, user, rememberMe);
    return { token: accessToken, user, redirectPath: redirect_path };
  }

  const { data } = await authApi.setEmployeePassword(token, apiPayload);
  const { accessToken, employee, redirect_path } = data.data;
  const user = buildEmployeeUser(employee);
  storeAuth(accessToken, user, rememberMe);
  return { token: accessToken, user, redirectPath: redirect_path };
}

function isInviteNotFoundError(err: unknown): boolean {
  const status = (err as { response?: { status?: number } })?.response?.status;
  return status === 404;
}

async function validateInvite(token: string): Promise<InviteTokenPayload> {
  try {
    const { data } = await authApi.verifyEmployeeInvite(token);
    return {
      name:         data.data.name,
      email:        data.data.email,
      exp:          data.data.exp ?? 0,
      inviteType:   'employee',
      accessToken:  data.data.accessToken,
      redirectPath: data.data.redirect_path,
      employee:     data.data.employee,
    };
  } catch (err) {
    if (!isInviteNotFoundError(err)) throw err;
    const { data } = await authApi.verifyAdminInvite(token);
    return {
      name:         data.data.name,
      email:        data.data.email,
      exp:          data.data.exp ?? 0,
      inviteType:   'admin',
      accessToken:  data.data.accessToken,
      redirectPath: data.data.redirect_path,
      admin:        data.data.admin,
    };
  }
}

/** Admin forgot-password — public endpoint, no Bearer token. */
async function requestPasswordReset(email: string): Promise<string> {
  const { data } = await authApi.adminForgotPassword({ email: email.trim() });
  return data?.message ?? '';
}

/** Admin reset token verification — public endpoint, no Bearer token. */
async function validateResetToken(token: string): Promise<PasswordResetTokenPayload> {
  const { data } = await authApi.verifyAdminPasswordReset(token);
  const profile = data.data;
  return {
    actorType:    profile.actorType ?? 'admin',
    actorId:      profile.admin_id ?? profile.user_id ?? '',
    email:        profile.email,
    name:         profile.name,
    redirectPath: profile.redirect_path,
  };
}

/** Admin password reset submit — public endpoint, no Bearer token. */
async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  const { token, password, confirmPassword } = payload;
  await authApi.resetAdminPassword(token, {
    password,
    password_confirmation: confirmPassword,
  });
}

async function completeInviteLogin(
  token: string,
  inviteType: 'admin' | 'employee',
  profile?: ApiAdmin | ApiEmployee,
): Promise<AuthUser> {
  let user: AuthUser;

  if (profile) {
    user = inviteType === 'admin'
      ? buildAdminUser(profile as ApiAdmin)
      : buildEmployeeUser(profile as ApiEmployee);
  } else {
    storeAuth(token, normalizeStoredUser({
      id: '', employeeId: '', fullName: '', role: inviteType === 'admin' ? 'admin' : 'employee',
      roles: [], permissions: [], actor: inviteType,
    }), true);
    user = await fetchProfile(inviteType);
  }

  storeAuth(token, user, true);
  return user;
}

async function loadProfile(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  const stored = getStoredUser();
  if (!stored) return null;

  try {
    const fresh = await fetchProfile(stored.actor);
    updateStoredUser(fresh);
    return fresh;
  } catch {
    return stored;
  }
}

async function changePassword(payload: {
  currentPassword: string;
  newPassword:     string;
  confirmPassword: string;
}): Promise<void> {
  const stored = getStoredUser();
  const apiPayload = {
    current_password: payload.currentPassword,
    new_password: payload.newPassword,
    new_password_confirmation: payload.confirmPassword,
  };

  if (stored?.actor === 'employee') {
    await authApi.employeeChangePassword(apiPayload);
  } else {
    await authApi.adminChangePassword(apiPayload);
  }
}

async function logout(): Promise<void> {
  const stored = getStoredUser();
  try {
    if (stored?.actor === 'employee') {
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
  verifyAdminOtp,
  resendAdminOtp,
  completeMagicLogin,
  completeInviteLogin,
  setPassword,
  activateInvite,
  changePassword,
  validateInvite,
  requestPasswordReset,
  validateResetToken,
  resetPassword,
  loadProfile,
  logout,
  getStoredToken,
  getStoredUser,
  clearAuth,
};
