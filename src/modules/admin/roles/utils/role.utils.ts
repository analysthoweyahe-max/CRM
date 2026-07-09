import type { ApiRole } from '../types/adminRole.types';

function permissionSlug(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'name' in value) {
    const name = (value as { name?: unknown }).name;
    return typeof name === 'string' ? name : null;
  }
  return null;
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
