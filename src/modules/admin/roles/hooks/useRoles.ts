import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { roleApi } from '../api/role.api';
import { normalizeRole } from '../utils/role.utils';
import type { ApiRole, CreateRolePayload, UpdateRolePayload } from '../types/adminRole.types';

const ROLES_KEY = ['admin', 'roles'];

function rolesQueryKey(guardName: string) {
  return [...ROLES_KEY, guardName];
}

function normalizeRoleList(payload: unknown): ApiRole[] {
  return toApiArray<unknown>(payload)
    .map(normalizeRole)
    .filter((role): role is ApiRole => role !== null);
}

export function useRoleList(guardName = 'admin') {
  const { isSuperAdmin, can } = useAuth();
  const canManageManagers = isSuperAdmin || can('create-admin') || can('assign-role');

  return useQuery({
    queryKey: rolesQueryKey(guardName),
    queryFn:  () => roleApi.list(guardName).then((r) => normalizeRoleList(r.data.data)),
    enabled: guardName === 'admin' ? canManageManagers : isSuperAdmin,
    staleTime: 60 * 1000,
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
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateRolePayload }) => roleApi.update(id, payload),
    onSuccess:  async (r) => {
      qc.setQueryData(rolesQueryKey('admin'), normalizeRoleList(r.data.data));
      await refreshUser();
    },
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roleApi.remove(id),
    onSuccess:  (r) => qc.setQueryData(rolesQueryKey('admin'), normalizeRoleList(r.data.data)),
  });
}
