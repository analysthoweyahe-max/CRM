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

type AccountType = 'employee' | 'admin';

function setCachedAccountType(identifier: string, type: AccountType): void {
  localStorage.setItem(ACCOUNT_TYPE_KEY + identifier, type);
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
    employeeNumber: raw.employeeNumber
      ?? (typeof extra.employee_number === 'string' ? extra.employee_number : undefined),
    sectionLabel: raw.sectionLabel ?? (typeof extra.section_label === 'string' ? extra.section_label : undefined),
  };
}

function buildEmployeeUser(raw: ApiEmployee): AuthUser {
  const employee = normalizeApiEmployee(raw);
  return {
    id:           employee.id,
    employeeId:   employee.employeeNumber ?? employee.id,
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

function unwrapLoginPayload(response: unknown): Record<string, unknown> {
  const root = response as Record<string, unknown>;
  const inner = root.data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return root;
}

const EMPLOYEE_ROLE_SLUGS = new Set([
  'employee', 'pm-employee', 'seo-employee', 'seo-member',
  'project-manager', 'seo-leader', 'seo-manager',
]);

const ADMIN_ROLE_SLUGS = new Set(['super-admin', 'admin', 'hr-manager', 'hr']);

function readActorHint(payload: Record<string, unknown>): AuthActor | null {
  const raw = payload.actorType ?? payload.actor_type ?? payload.guard_name ?? payload.guard;
  if (raw === 'employee' || raw === 'web') return 'employee';
  if (raw === 'admin') return 'admin';
  return null;
}

function inferActorFromRoles(roles: string[]): AuthActor | null {
  const hasAdmin = roles.some((r) => ADMIN_ROLE_SLUGS.has(r));
  const hasEmployee = roles.some((r) => EMPLOYEE_ROLE_SLUGS.has(r));
  if (hasAdmin && !hasEmployee) return 'admin';
  if (hasEmployee && !hasAdmin) return 'employee';
  return null;
}

function isProfileRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function asApiEmployee(raw: Record<string, unknown>): ApiEmployee {
  return raw as unknown as ApiEmployee;
}

function asApiAdmin(raw: Record<string, unknown>): ApiAdmin {
  return raw as unknown as ApiAdmin;
}

function parseLoginProfile(payload: Record<string, unknown>): { admin?: ApiAdmin; employee?: ApiEmployee } {
  const nestedEmployee = payload.employee;
  if (isProfileRecord(nestedEmployee)) {
    return { employee: asApiEmployee(nestedEmployee) };
  }

  const nestedAdmin = payload.admin;
  if (isProfileRecord(nestedAdmin)) {
    const roles = normalizeRolesField(nestedAdmin.roles).slugs;
    const actor = readActorHint(nestedAdmin) ?? inferActorFromRoles(roles);
    if (actor === 'employee') return { employee: asApiEmployee(nestedAdmin) };
    return { admin: asApiAdmin(nestedAdmin) };
  }

  const nestedUser = payload.user;
  if (isProfileRecord(nestedUser)) {
    const roles = normalizeRolesField(nestedUser.roles).slugs;
    const actor = readActorHint(nestedUser) ?? inferActorFromRoles(roles);
    if (actor === 'employee') return { employee: asApiEmployee(nestedUser) };
    if (actor === 'admin') return { admin: asApiAdmin(nestedUser) };
  }

  if (payload.id && (payload.name || payload.email)) {
    const roles = normalizeRolesField(payload.roles).slugs;
    const actor = readActorHint(payload) ?? inferActorFromRoles(roles);
    if (actor === 'employee') return { employee: asApiEmployee(payload) };
    if (actor === 'admin') return { admin: asApiAdmin(payload) };
  }

  return {};
}

function profileFetchOrder(payload: Record<string, unknown>): AuthActor[] {
  const actor = readActorHint(payload);
  const redirect = typeof payload.redirect_path === 'string' ? payload.redirect_path : '';
  if (actor === 'employee' || /\/employee(?:\/|$)/i.test(redirect)) return ['employee', 'admin'];
  if (actor === 'admin' || /\/admin(?:\/|$)/i.test(redirect)) return ['admin', 'employee'];
  return ['employee', 'admin'];
}

async function resolveLoginUser(
  accessToken: string,
  payload: Record<string, unknown>,
  rememberMe: boolean,
): Promise<AuthUser> {
  const { admin, employee } = parseLoginProfile(payload);
  if (employee) return buildEmployeeUser(employee);
  if (admin) return buildAdminUser(admin);

  const [first, second] = profileFetchOrder(payload);
  storeAuth(accessToken, normalizeStoredUser({
    id: '', employeeId: '', fullName: '', role: first === 'employee' ? 'employee' : 'admin',
    roles: [], permissions: [], actor: first,
  }), rememberMe);

  for (const actor of [first, second]) {
    try {
      return await fetchProfile(actor);
    } catch {
      // try the other guard
    }
  }

  throw new Error('Invalid login response');
}

function readAdminAuthSuccess(data: Record<string, unknown>) {
  const accessToken = readAccessToken(data);
  const { admin, employee } = parseLoginProfile(data);
  const redirect_path = typeof data.redirect_path === 'string' ? data.redirect_path : undefined;
  return { accessToken, admin, employee, redirect_path };
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

async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const { password, rememberMe = false } = credentials;
  const identifier = credentials.adminId.trim();

  const { data } = await authApi.adminLogin({ admin_id: identifier, password });
  const payload = unwrapLoginPayload(data);

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

  const accessToken = readAccessToken(payload);
  if (!accessToken) {
    throw new Error('Invalid login response');
  }

  const redirect_path = typeof payload.redirect_path === 'string' ? payload.redirect_path : undefined;
  const user = await resolveLoginUser(accessToken, payload, rememberMe);
  storeAuth(accessToken, user, rememberMe);
  setCachedAccountType(identifier, user.actor);
  return {
    status:       'success',
    token:        accessToken,
    user,
    redirectPath: redirect_path,
  };
}

async function verifyAdminOtp(adminId: string, otp: string, rememberMe = false): Promise<AuthLoginResponse> {
  const { data } = await authApi.adminVerifyOtp({ admin_id: adminId, code: otp });
  const payload = unwrapLoginPayload(data);
  const { accessToken, admin, redirect_path } = readAdminAuthSuccess(payload);
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
  const payload = unwrapLoginPayload(data);
  return String(payload.expiresAt ?? payload.expires_at ?? '');
}

async function completeMagicLogin(token: string, rememberMe = true): Promise<AuthUser> {
  const { data } = await authApi.adminMagicLogin(token);
  const payload = unwrapLoginPayload(data);
  const { accessToken, admin } = readAdminAuthSuccess(payload);
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
    const payload = unwrapLoginPayload(data);
    const { accessToken, admin, redirect_path } = readAdminAuthSuccess(payload);
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

/**
 * Forgot-password form is shared between admins and employees, and this
 * page has no way to know which one is submitting — so try the admin
 * endpoint first and fall back to the employee one if the email isn't
 * an admin account (mirrors the same admin-then-employee fallback the
 * login flow already uses in `fetchProfile`/`loadProfile` above).
 */
async function requestPasswordReset(email: string): Promise<string> {
  const trimmed = email.trim();
  try {
    const { data } = await authApi.adminForgotPassword({ email: trimmed });
    return data?.message ?? '';
  } catch {
    const { data } = await authApi.employeeForgotPassword({ email: trimmed });
    return data?.message ?? '';
  }
}

/** Reset-link token can belong to an admin or an employee — try both. */
async function validateResetToken(token: string): Promise<PasswordResetTokenPayload> {
  try {
    const { data } = await authApi.verifyAdminPasswordReset(token);
    const profile = data.data;
    return {
      actorType:    profile.actorType ?? 'admin',
      actorId:      profile.admin_id ?? profile.user_id ?? '',
      email:        profile.email,
      name:         profile.name,
      redirectPath: profile.redirect_path,
    };
  } catch {
    const { data } = await authApi.verifyEmployeePasswordReset(token);
    const profile = data.data;
    return {
      actorType:    profile.actorType ?? 'employee',
      actorId:      profile.employee_id ?? profile.admin_id ?? profile.user_id ?? '',
      email:        profile.email,
      name:         profile.name,
      redirectPath: profile.redirect_path,
    };
  }
}

/** Password reset submit — routes to the admin or employee endpoint per the verified token's actor type. */
async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  const { token, password, confirmPassword, actorType } = payload;
  const body = { password, password_confirmation: confirmPassword };
  if (actorType === 'employee') {
    await authApi.resetEmployeePassword(token, body);
  } else {
    await authApi.resetAdminPassword(token, body);
  }
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
