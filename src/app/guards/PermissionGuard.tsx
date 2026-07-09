import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { ROUTES } from '@/app/router/routes';
import { canAccess, canAccessRole, isSuperAdminUser } from '@/shared/utils/authPermissions.utils';

interface PermissionGuardProps {
  /** Required permission slug(s) from the auth response. */
  permission?: string | string[];
  /** Required backend role slug(s). */
  role?:         string | string[];
  /** When multiple permissions are given, require all instead of any. */
  match?:        'any' | 'all';
  /** Optional fallback when access is denied (inline usage). */
  fallback?:     ReactNode;
  children?:     ReactNode;
}

export function PermissionGuard({
  permission,
  role,
  match = 'any',
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    if (children !== undefined) return fallback;
    return <Navigate to={ROUTES.UNAUTHORIZED} replace state={{ from: location.pathname }} />;
  }

  if (isSuperAdminUser(user)) {
    return children !== undefined ? children : <Outlet />;
  }

  const allowedByPermission = permission
    ? canAccess(user.permissions, user.roles, permission, match, false)
    : true;

  const allowedByRole = role
    ? canAccessRole(user.roles, role, false)
    : true;

  if (!allowedByPermission || !allowedByRole) {
    if (children !== undefined) return fallback;
    return <Navigate to={ROUTES.UNAUTHORIZED} replace state={{ from: location.pathname }} />;
  }

  return children !== undefined ? children : <Outlet />;
}
