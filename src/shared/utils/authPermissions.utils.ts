/** Backend permission slug checks (Spatie admin guard). */
export function can(permissions: string[] | undefined, permission: string): boolean {
  return permissions?.includes(permission) ?? false;
}

export function hasRole(roles: string[] | undefined, role: string): boolean {
  return roles?.includes(role) ?? false;
}

export function hasAnyPermission(permissions: string[] | undefined, slugs: string[]): boolean {
  return slugs.some((slug) => can(permissions, slug));
}

export function hasAllPermissions(permissions: string[] | undefined, slugs: string[]): boolean {
  return slugs.length > 0 && slugs.every((slug) => can(permissions, slug));
}

export function hasAnyRole(roles: string[] | undefined, slugs: string[]): boolean {
  return slugs.some((slug) => hasRole(roles, slug));
}

/** True when the backend role slug is super-admin. */
export function isSuperAdmin(roles: string[] | undefined): boolean {
  return hasRole(roles, 'super-admin');
}

/** Super-admin bypass — only `isSuperAdmin` flag or super-admin role slug. */
export function isSuperAdminUser(
  user: { roles?: string[]; isSuperAdmin?: boolean } | null | undefined,
): boolean {
  if (!user) return false;
  if (user.isSuperAdmin) return true;
  return isSuperAdmin(user.roles);
}

export function canAccess(
  permissions: string[] | undefined,
  roles: string[] | undefined,
  permission: string | string[],
  match: 'any' | 'all' = 'any',
  isSuperAdminFlag = false,
): boolean {
  if (isSuperAdminFlag || isSuperAdmin(roles)) return true;
  const slugs = Array.isArray(permission) ? permission : [permission];
  return match === 'all'
    ? hasAllPermissions(permissions, slugs)
    : hasAnyPermission(permissions, slugs);
}

export function canAccessRole(
  roles: string[] | undefined,
  required: string | string[],
  isSuperAdminFlag = false,
): boolean {
  if (isSuperAdminFlag || isSuperAdmin(roles)) return true;
  const slugs = Array.isArray(required) ? required : [required];
  return hasAnyRole(roles, slugs);
}

/** Primary UI permission check — flat permissions array; super-admin always allowed. */
export function hasPermission(
  user: { permissions: string[]; isSuperAdmin?: boolean; roles?: string[] } | null | undefined,
  permission: string,
): boolean {
  if (!user) return false;
  if (isSuperAdminUser(user)) return true;
  return user.permissions.includes(permission);
}
