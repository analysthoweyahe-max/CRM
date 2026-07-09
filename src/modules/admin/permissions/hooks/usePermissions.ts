import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { permissionApi } from '../api/permission.api';
import { normalizePermissionList } from '../utils/permission.utils';
import type { ApiPermission, CreatePermissionPayload, UpdatePermissionPayload } from '../types/adminPermission.types';

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

export function useCreatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePermissionPayload) => permissionApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: PERMISSIONS_KEY }),
  });
}

export function useUpdatePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePermissionPayload }) =>
      permissionApi.update(id, payload),
    onSuccess:  (r) => qc.setQueryData(PERMISSIONS_KEY, normalizePermissionList(r.data.data)),
  });
}

export function useDeletePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => permissionApi.remove(id),
    onSuccess:  (r) => qc.setQueryData(PERMISSIONS_KEY, normalizePermissionList(r.data.data)),
  });
}

export type { ApiPermission };
