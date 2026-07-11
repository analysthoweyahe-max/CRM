import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/modules/auth/context/AuthContext';

import { adminApi } from '../api/admin.api';

import { HR_CREATABLE_MANAGER_ROLES, type CreateAdminPayload } from '../types/adminManager.types';
import { resolveAssignableRoleName } from '../utils/role.utils';

export function useCreateAdmin() {
  const qc = useQueryClient();
  const { isSuperAdmin } = useAuth();

  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => {
      const role = resolveAssignableRoleName(payload.role);
      if (!role) {
        return Promise.reject(new Error('Invalid role'));
      }

      if (isSuperAdmin) {
        return adminApi.create({ ...payload, role });
      }

      const allowed = HR_CREATABLE_MANAGER_ROLES as readonly string[];
      const safeRole = allowed.includes(role) ? role : allowed[0];
      return adminApi.create({ name: payload.name, email: payload.email, role: safeRole });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'managers'] }),
  });
}
