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
  const { can, user } = useAuth();

  if (!user) return fallback;

  return can(permission, match) ? children : fallback;
}
