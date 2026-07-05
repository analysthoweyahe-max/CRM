import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { permissionApi } from '../api/permission.api';
import type { ApiPermission, CreatePermissionPayload, UpdatePermissionPayload } from '../types/adminPermission.types';

const PERMISSIONS_KEY = ['admin', 'permissions'];

export function usePermissionList() {
  return useQuery({
    queryKey: PERMISSIONS_KEY,
    queryFn:  () => permissionApi.list().then((r) => toApiArray<ApiPermission>(r.data.data)),
    staleTime: 60 * 1000,
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
    // The backend returns the refreshed list on update — use it directly instead of refetching.
    onSuccess:  (r) => qc.setQueryData(PERMISSIONS_KEY, toApiArray<ApiPermission>(r.data.data)),
  });
}

export function useDeletePermission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => permissionApi.remove(id),
    onSuccess:  (r) => qc.setQueryData(PERMISSIONS_KEY, toApiArray<ApiPermission>(r.data.data)),
  });
}
