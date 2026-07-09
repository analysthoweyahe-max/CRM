import type { ReactNode } from 'react';
import { useAuth } from '@/modules/auth/context/AuthContext';

interface HasRoleProps {
  role:      string | string[];
  children:  ReactNode;
  fallback?: ReactNode;
}

/** Renders children only when the user has the required backend role slug(s). */
export function HasRole({ role, children, fallback = null }: HasRoleProps) {
  const { hasRole } = useAuth();
  return hasRole(role) ? children : fallback;
}
