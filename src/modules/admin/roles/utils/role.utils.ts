import { getRoleNameLabel, roleSlugFromLabel } from '../types/adminRole.types';
import type { ApiRole } from '../types/adminRole.types';

function permissionSlug(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'name' in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === 'string' ? name : null;
  }
  return null;
}

/**
 * Extract an English role slug from API shapes:
 * string slug | numeric id | { name | slug } | Arabic/English display label.
 * Backend assign-role expects the slug (e.g. "hr-manager"), never id or label.
 */
export function extractRoleSlug(value: unknown, availableRoles: ApiRole[] = []): string | null {
  if (value == null) return null;

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const nested = record.name ?? record.slug;
    if (nested != null) return extractRoleSlug(nested, availableRoles);
    if (record.id != null) return extractRoleSlug(record.id, availableRoles);
    return null;
  }

  if (typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value.trim()))) {
    const byId = availableRoles.find((r) => String(r.id) === String(value).trim());
    return byId?.name ?? null;
  }

  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const byName = availableRoles.find((r) => r.name === trimmed);
  if (byName) return byName.name;

  // Spatie-style slug (built-in + custom roles from the roles panel).
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/i.test(trimmed)) {
    return trimmed;
  }

  const fromStatic = roleSlugFromLabel(trimmed);
  if (fromStatic) return fromStatic;

  for (const role of availableRoles) {
    if (
      getRoleNameLabel(role.name, true) === trimmed
      || getRoleNameLabel(role.name, false) === trimmed
    ) {
      return role.name;
    }
  }

  return null;
}

/** Normalize `roles` on an admin/manager payload to English slug strings. */
export function normalizeManagerRoleSlugs(
  roles: unknown,
  availableRoles: ApiRole[] = [],
): string[] {
  if (!Array.isArray(roles)) return [];
  const slugs: string[] = [];
  for (const item of roles) {
    const slug = extractRoleSlug(item, availableRoles);
    if (slug && !slugs.includes(slug)) slugs.push(slug);
  }
  return slugs;
}

/**
 * Resolve a form/select value to the slug the backend accepts for assign-role.
 * Never returns `super-admin` (not assignable via these forms).
 */
export function resolveAssignableRoleName(
  value: unknown,
  availableRoles: ApiRole[] = [],
): string | null {
  const slug = extractRoleSlug(value, availableRoles);
  if (!slug || slug === 'super-admin') return null;
  return slug;
}

export function normalizeRole(raw: unknown): ApiRole | null {
  if (!raw || typeof raw !== 'object') return null;

  const r = raw as Record<string, unknown>;
  if (r.id == null || r.name == null) return null;

  const permissions = Array.isArray(r.permissions)
    ? r.permissions.map(permissionSlug).filter((slug): slug is string => !!slug)
    : [];

  return {
    id:        Number(r.id),
    name:      String(r.name),
    guardName: (r.guardName ?? r.guard_name ?? 'admin') as ApiRole['guardName'],
    permissions,
    createdAt: String(r.createdAt ?? r.created_at ?? ''),
    updatedAt: String(r.updatedAt ?? r.updated_at ?? ''),
  };
}

export function roleHasPermission(role: ApiRole, slug: string): boolean {
  return role.permissions.includes(slug);
}

export function findRoleByName(roles: ApiRole[] | undefined, name: string): ApiRole | undefined {
  return roles?.find((r) => r.name === name);
}

export function permissionsForRole(roles: ApiRole[] | undefined, roleName: string): string[] {
  return findRoleByName(roles, roleName)?.permissions ?? [];
}

const LOCKED_ASSIGNABLE_ROLES = new Set(['super-admin']);

export function assignableRoles(roles: ApiRole[] | undefined, assigned: string[] = []): ApiRole[] {
  const taken = new Set(assigned);
  return (roles ?? []).filter((r) => !LOCKED_ASSIGNABLE_ROLES.has(r.name) && !taken.has(r.name));
}
