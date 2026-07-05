import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { roleApi } from '../api/role.api';
import type { ApiRole, CreateRolePayload, UpdateRolePayload } from '../types/adminRole.types';

const ROLES_KEY = ['admin', 'roles'];

export function useRoleList() {
  return useQuery({
    queryKey: ROLES_KEY,
    queryFn:  () => roleApi.list().then((r) => toApiArray<ApiRole>(r.data.data)),
  });
}

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRolePayload) => roleApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ROLES_KEY }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRolePayload }) => roleApi.update(id, payload),
    // The backend returns the refreshed list on update — use it directly instead of refetching.
    onSuccess:  (r) => qc.setQueryData(ROLES_KEY, toApiArray<ApiRole>(r.data.data)),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roleApi.remove(id),
    onSuccess:  (r) => qc.setQueryData(ROLES_KEY, toApiArray<ApiRole>(r.data.data)),
  });
}
