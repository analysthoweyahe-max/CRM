import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { permissionApi } from '../api/permission.api';
import { normalizePermissionList } from '../utils/permission.utils';
import type { ApiPermission } from '../types/adminPermission.types';

const PERMISSIONS_KEY = ['admin', 'permissions'];

export function usePermissionList() {
  const { isSuperAdmin } = useAuth();

  return useQuery({
    queryKey: PERMISSIONS_KEY,
    queryFn:  () => permissionApi.list().then((r) => normalizePermissionList(r.data.data)),
    staleTime: 60 * 1000,
    enabled: isSuperAdmin,
  });
}

export type { ApiPermission };
