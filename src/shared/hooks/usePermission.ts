import { useAuth } from '@/modules/auth/context/AuthContext';

/** Returns whether the current user has a backend permission slug. */
export function usePermission(permission: string | string[], match: 'any' | 'all' = 'any'): boolean {
  const { can } = useAuth();
  return can(permission, match);
}

/** Returns whether the current user has a backend role slug. */
export function useRole(role: string | string[]): boolean {
  const { hasRole } = useAuth();
  return hasRole(role);
}
