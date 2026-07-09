import type { ReactNode } from 'react';
import { useAuth } from '@/modules/auth/context/AuthContext';

interface CanProps {
  permission: string | string[];
  match?:     'any' | 'all';
  children:   ReactNode;
  fallback?:  ReactNode;
}

/** Renders children only when the user has the required permission slug(s). */
export function Can({ permission, match = 'any', children, fallback = null }: CanProps) {
  const { hasPermission, user } = useAuth();

  if (!user) return fallback;

  const slugs = Array.isArray(permission) ? permission : [permission];
  const allowed = match === 'all'
    ? slugs.every((p) => hasPermission(p))
    : slugs.some((p) => hasPermission(p));

  return allowed ? children : fallback;
}
