import { useAuth } from '@/features/auth/context/AuthContext';
import type { Permission } from '../types/role.types';

export function usePermission(permission: Permission): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}
