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
import { resetFcmRegistration } from '@/shared/services/fcm.service';
import { disconnectEcho } from '@/shared/realtime-messages';
import { queryClient } from '@/app/providers/QueryProvider';
import { ACCOUNT_TYPE_KEY } from '@/app/config/constants';
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredUser as readStoredUser,
  readAccessTokenFromPayload,
  readRefreshTokenFromPayload,
  readRememberFromPayload,
  storeAuthSession,
  updateStoredUser as writeStoredUser,
} from './tokenStorage';

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
    // Profile/login endpoints return the photo under `avatar`, not `avatar_url`.
    avatar_url:   raw.avatar_url ?? (typeof extra.avatar === 'string' ? extra.avatar : undefined),
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
    phone:        admin.phone,
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

  const mappedRole = mapRolesToAppRole(roles, raw.role);
  const actor = resolveProfileActor({
    ...raw,
    roles,
    role: mappedRole,
  });

  const permissions = actor === 'admin'
    ? normalizePermissionSlugs(raw.permissions)
    : mergeEffectivePermissions(normalizePermissionSlugs(raw.permissions), roleDetails);

  return {
    ...raw,
    role: mappedRole,
    roles,
    permissions,
    roleDetails,
    actor,
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
  return readAccessTokenFromPayload(payload);
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
  'employee',
  'pm-employee',
  'seo-employee',
  'seo-member',
]);

/** Spatie `admin` guard — managers (PM / SEO / HR) use admin auth + profile. */
const ADMIN_ROLE_SLUGS = new Set([
  'super-admin',
  'admin',
  'hr-manager',
  'hr',
  'project-manager',
  'manager',
  'seo-manager',
  'seo-leader',
]);

function readActorHint(payload: Record<string, unknown>): AuthActor | null {
  const raw = payload.actorType ?? payload.actor_type ?? payload.guard_name ?? payload.guard;
  if (raw === 'employee' || raw === 'web') return 'employee';
  if (raw === 'admin') return 'admin';
  return null;
}

function inferActorFromRoles(roles: string[]): AuthActor | null {
  const hasAdmin = roles.some((r) => ADMIN_ROLE_SLUGS.has(r));
  const hasEmployee = roles.some((r) => EMPLOYEE_ROLE_SLUGS.has(r));
  // Employee guard wins for profile when both appear — seo/pm employees must
  // use /v1/employee/auth/profile even if a stray admin slug is present.
  if (hasEmployee) return 'employee';
  if (hasAdmin) return 'admin';
  return null;
}

/**
 * Which profile endpoint to call.
 * Portal role wins — it is what RoleGuard used to place the user.
 * Employee / SEO member → /v1/employee/auth/profile
 * Admin / HR / PM / SEO leader → /v1/admin/auth/profile
 */
function resolveProfileActor(user: Pick<AuthUser, 'actor' | 'role' | 'roles' | 'isSuperAdmin'>): AuthActor {
  if (user.isSuperAdmin) return 'admin';

  // Prefer mapped portal role over raw Spatie slugs.
  if (user.role === 'employee' || user.role === 'seo-member') return 'employee';
  if (user.role === 'admin' || user.role === 'hr' || user.role === 'manager' || user.role === 'seo-leader') {
    return 'admin';
  }

  // Explicit session actor (set at login / previous normalize).
  if (user.actor === 'employee') return 'employee';

  const fromRoles = inferActorFromRoles(user.roles ?? []);
  if (fromRoles) return fromRoles;

  return 'admin';
}

function collectPayloadRoleSlugs(payload: Record<string, unknown>): string[] {
  const bags: unknown[] = [payload.roles];
  for (const key of ['employee', 'admin', 'user'] as const) {
    const nested = payload[key];
    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      bags.push((nested as Record<string, unknown>).roles);
    }
  }
  const slugs: string[] = [];
  for (const bag of bags) {
    const { slugs: part } = normalizeRolesField(bag);
    for (const s of part) {
      if (!slugs.includes(s)) slugs.push(s);
    }
  }
  return slugs;
}

/** Pick exactly one auth guard for the post-login profile fetch — never probe both. */
function resolveLoginProfileActor(payload: Record<string, unknown>): AuthActor {
  const actor = readActorHint(payload);
  const redirect = typeof payload.redirect_path === 'string' ? payload.redirect_path : '';
  const roleSlugs = collectPayloadRoleSlugs(payload);
  const fromRoles = inferActorFromRoles(roleSlugs);

  // Employee signals always win (seo-member / pm-employee).
  if (
    fromRoles === 'employee'
    || actor === 'employee'
    || Boolean(payload.employee)
    || /\/employee(?:\/|$)/i.test(redirect)
    || /\/seo-member(?:\/|$)/i.test(redirect)
  ) {
    return 'employee';
  }

  // Admin only when roles or portal redirect confirm it — do NOT trust a lone actorType=admin
  // (backend has been tagging seo employees as admin, which caused dual profile calls).
  if (
    fromRoles === 'admin'
    || /\/admin(?:\/|$)/i.test(redirect)
    || /\/project-manager(?:\/|$)/i.test(redirect)
    || /\/seo-leader(?:\/|$)/i.test(redirect)
    || /\/admin-dashboard/i.test(redirect)
  ) {
    return 'admin';
  }

  if (payload.admin && fromRoles !== 'employee') {
    const nested = payload.admin as Record<string, unknown>;
    const nestedRoles = normalizeRolesField(nested.roles).slugs;
    const nestedActor = inferActorFromRoles(nestedRoles) ?? readActorHint(nested);
    if (nestedActor === 'employee') return 'employee';
    if (nestedActor === 'admin') return 'admin';
  }

  // Ambiguous → employee profile (admins usually include role slugs or redirect).
  return 'employee';
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

async function resolveLoginUser(
  accessToken: string,
  payload: Record<string, unknown>,
  rememberMe: boolean,
  refreshToken?: string | null,
): Promise<AuthUser> {
  const actorHint = readActorHint(payload);
  const { admin, employee } = parseLoginProfile(payload);

  if (actorHint === 'employee' && employee) return buildEmployeeUser(employee);
  if (employee) return buildEmployeeUser(employee);

  if (admin) {
    const adminRoles = normalizeRolesField(admin.roles).slugs;
    if (actorHint === 'employee' || inferActorFromRoles(adminRoles) === 'employee') {
      return buildEmployeeUser(admin as unknown as ApiEmployee);
    }
    if (actorHint === 'admin' || inferActorFromRoles(adminRoles) === 'admin') {
      return buildAdminUser(admin);
    }
  }

  // Exactly one profile request — never probe the other guard.
  const actor = resolveLoginProfileActor(payload);
  storeAuthSession(accessToken, normalizeStoredUser({
    id: '', employeeId: '', fullName: '',
    role: actor === 'employee' ? 'employee' : 'admin',
    roles: [], permissions: [], actor,
  }), rememberMe, refreshToken);

  return fetchProfile(actor);
}

function readAdminAuthSuccess(data: Record<string, unknown>) {
  const accessToken = readAccessToken(data);
  const refreshToken = readRefreshTokenFromPayload(data);
  const { admin, employee } = parseLoginProfile(data);
  const redirect_path = typeof data.redirect_path === 'string' ? data.redirect_path : undefined;
  return { accessToken, refreshToken, admin, employee, redirect_path };
}

// ── Storage ──────────────────────────────────────────────────────────────────

function storeAuth(
  token: string,
  user: AuthUser,
  rememberMe: boolean,
  refreshToken?: string | null,
): void {
  // Always persist normalized actor so seo-member never keeps actor:'admin'.
  storeAuthSession(token, normalizeStoredUser(user), rememberMe, refreshToken);
}

function updateStoredUser(user: AuthUser): void {
  writeStoredUser(user);
}

function clearAuth(): void {
  clearAuthSession();
}

function getStoredToken(): string | null {
  return getStoredAccessToken();
}

function getStoredUser(): AuthUser | null {
  const user = readStoredUser();
  if (!user) return null;
  const normalized = normalizeStoredUser(user);
  // Persist corrected actor for legacy sessions that mis-tagged managers as employees.
  if (normalized.actor !== user.actor) {
    writeStoredUser(normalized);
  }
  return normalized;
}

async function fetchProfile(actor: AuthActor): Promise<AuthUser> {
  if (actor === 'employee') {
    const { data } = await authApi.employeeProfile();
    return buildEmployeeUser(data.data.employee);
  }
  const { data } = await authApi.adminProfile();
  return buildAdminUser(parseAdminProfilePayload(data.data));
}

async function loadProfile(): Promise<AuthUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  const stored = getStoredUser();
  if (!stored) return null;

  const actor = resolveProfileActor(stored);

  try {
    const fresh = await fetchProfile(actor);
    updateStoredUser(fresh);
    return fresh;
  } catch {
    // Never cross employee↔admin — dual requests and sticky wrong sessions.
    return stored;
  }
}

// ── Auth operations ───────────────────────────────────────────────────────────

/**
 * Unified login — POST /v1/admin/auth/login with { email | admin_id, password }.
 * Backend returns actorType admin | employee; no OTP step.
 */
async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const password = credentials.password;
  const identifier = credentials.email.trim();
  const rememberFallback = credentials.rememberMe ?? false;

  const { data } = await authApi.adminLogin({
    identifier,
    password,
    remember: rememberFallback,
  });
  const payload = unwrapLoginPayload(data);

  const accessToken = readAccessToken(payload);
  if (!accessToken) {
    throw new Error('Invalid login response');
  }

  const refreshToken = readRefreshTokenFromPayload(payload);
  const rememberMe = readRememberFromPayload(payload, rememberFallback);
  const redirect_path = typeof payload.redirect_path === 'string' ? payload.redirect_path : undefined;
  const user = await resolveLoginUser(accessToken, payload, rememberMe, refreshToken);
  storeAuth(accessToken, user, rememberMe, refreshToken);
  setCachedAccountType(identifier, user.actor === 'employee' ? 'employee' : 'admin');

  return {
    status:       'success',
    token:        accessToken,
    user,
    redirectPath: redirect_path,
  };
}

async function verifyAdminOtp(adminId: string, otp: string, rememberMe = false): Promise<AuthLoginResponse> {
  const { data } = await authApi.adminVerifyOtp({
    admin_id: adminId,
    adminId,
    code:     otp,
    otp,
    remember: rememberMe,
  });
  const payload = unwrapLoginPayload(data);
  const { accessToken, refreshToken, admin, redirect_path } = readAdminAuthSuccess(payload);
  if (!accessToken || !admin) {
    throw new Error('Invalid OTP verification response');
  }
  const remember = readRememberFromPayload(payload, rememberMe);
  const user = buildAdminUser(admin);
  storeAuth(accessToken, user, remember, refreshToken);
  setCachedAccountType(adminId, 'admin');
  return { token: accessToken, user, redirectPath: redirect_path };
}

async function resendAdminOtp(
  adminId: string,
): Promise<{ expiresAt: string; adminId: string }> {
  const { data } = await authApi.adminResendOtp({
    admin_id: adminId,
    adminId,
  });
  const payload = unwrapLoginPayload(data);
  const expiresAt = String(payload.expiresAt ?? payload.expires_at ?? '');
  const nextAdminId = String(payload.adminId ?? payload.admin_id ?? adminId).trim() || adminId;
  return { expiresAt, adminId: nextAdminId };
}

async function completeMagicLogin(token: string, rememberMe = true): Promise<AuthUser> {
  const { data } = await authApi.adminMagicLogin(token);
  const payload = unwrapLoginPayload(data);
  const { accessToken, refreshToken, admin } = readAdminAuthSuccess(payload);
  if (!accessToken || !admin) {
    throw new Error('Invalid magic login response');
  }
  const remember = readRememberFromPayload(payload, rememberMe);
  const user = buildAdminUser(admin);
  storeAuth(accessToken, user, remember, refreshToken);
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
    const body = unwrapLoginPayload(data);
    const { accessToken, refreshToken, admin, redirect_path } = readAdminAuthSuccess(body);
    if (!accessToken || !admin) {
      throw new Error('Invalid set-password response');
    }
    const remember = readRememberFromPayload(body, rememberMe);
    const user = buildAdminUser(admin);
    storeAuth(accessToken, user, remember, refreshToken);
    return { token: accessToken, user, redirectPath: redirect_path };
  }

  const { data } = await authApi.setEmployeePassword(token, apiPayload);
  const body = unwrapLoginPayload(data);
  const accessToken = readAccessToken(body);
  const refreshToken = readRefreshTokenFromPayload(body);
  const { employee } = parseLoginProfile(body);
  if (!accessToken || !employee) {
    throw new Error('Invalid set-password response');
  }
  const remember = readRememberFromPayload(body, rememberMe);
  const user = buildEmployeeUser(employee);
  const redirect_path = typeof body.redirect_path === 'string' ? body.redirect_path : undefined;
  storeAuth(accessToken, user, remember, refreshToken);
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
 * Employee forgot-password — sends a 6-digit OTP to the email.
 * Always succeeds from the UI perspective (unknown emails still navigate forward).
 */
async function requestEmployeeResetOtp(email: string): Promise<string> {
  const { data } = await authApi.employeeForgotPassword({ email: email.trim() });
  return (
    data?.data?.expiresAt
    ?? new Date(Date.now() + 10 * 60 * 1000).toISOString()
  );
}

async function verifyEmployeeResetOtp(email: string, code: string): Promise<string> {
  const { data } = await authApi.employeeVerifyResetOtp({ email: email.trim(), code, otp: code });
  const payload = data?.data as Record<string, unknown> | null | undefined;
  const token = payload?.token ?? payload?.reset_token ?? payload?.resetToken;
  if (typeof token !== 'string' || !token) throw new Error('Missing reset token');
  return token;
}

async function resetEmployeePasswordOtp(payload: {
  token:           string;
  password:        string;
  confirmPassword: string;
}): Promise<void> {
  await authApi.employeeResetPasswordOtp({
    token:                 payload.token,
    password:              payload.password,
    password_confirmation: payload.confirmPassword,
  });
}

/** Admin forgot-password — sends an email reset link. */
async function requestAdminPasswordReset(email: string): Promise<string> {
  const { data } = await authApi.adminForgotPassword({ email: email.trim() });
  return data?.message ?? '';
}

/** Reset-link token validation — admin email-link flow only. */
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

/** Password reset submit — admin email-link flow only. */
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

  if (stored && resolveProfileActor(stored) === 'employee') {
    await authApi.employeeChangePassword(apiPayload);
  } else {
    await authApi.adminChangePassword(apiPayload);
  }
}

async function updateProfile(payload: { name: string; email: string; phone: string }): Promise<AuthUser> {
  const { data } = await authApi.adminUpdateProfile(payload);
  const user = buildAdminUser(parseAdminProfilePayload(data.data));
  updateStoredUser(user);
  return user;
}

async function uploadAvatar(file: File): Promise<AuthUser> {
  const { data } = await authApi.adminUploadAvatar(file);
  const user = buildAdminUser(parseAdminProfilePayload(data.data));
  updateStoredUser(user);
  return user;
}

async function deleteAvatar(): Promise<AuthUser> {
  const { data } = await authApi.adminDeleteAvatar();
  const user = buildAdminUser(parseAdminProfilePayload(data.data));
  updateStoredUser(user);
  return user;
}

async function logout(): Promise<void> {
  const stored = getStoredUser();
  try {
    if (stored && resolveProfileActor(stored) === 'employee') {
      await authApi.employeeLogout();
    } else {
      await authApi.adminLogout();
    }
  } finally {
    clearAuth();
    resetFcmRegistration();
    disconnectEcho();
    queryClient.clear();
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
  updateProfile,
  uploadAvatar,
  deleteAvatar,
  validateInvite,
  requestEmployeeResetOtp,
  verifyEmployeeResetOtp,
  resetEmployeePasswordOtp,
  requestAdminPasswordReset,
  validateResetToken,
  resetPassword,
  loadProfile,
  logout,
  getStoredToken,
  getStoredUser,
  clearAuth,
};
