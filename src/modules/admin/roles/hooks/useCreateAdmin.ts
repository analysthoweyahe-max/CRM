import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/modules/auth/context/AuthContext';

import { adminApi } from '../api/admin.api';

import { HR_CREATABLE_MANAGER_ROLES, type CreateAdminPayload } from '../types/adminManager.types';
import { resolveAssignableRoleNames } from '../utils/role.utils';

export function useCreateAdmin() {
  const qc = useQueryClient();
  const { isSuperAdmin } = useAuth();

  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => {
      const roles = resolveAssignableRoleNames(payload.roles);
      if (roles.length === 0) {
        return Promise.reject(new Error('Invalid role'));
      }

      if (isSuperAdmin) {
        return adminApi.create({ ...payload, roles });
      }

      const allowed = HR_CREATABLE_MANAGER_ROLES as readonly string[];
      const safeRoles = roles.filter((r) => allowed.includes(r));
      return adminApi.create({
        name:  payload.name,
        email: payload.email,
        roles: safeRoles.length > 0 ? safeRoles : [allowed[0]],
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'managers'] }),
  });
}
