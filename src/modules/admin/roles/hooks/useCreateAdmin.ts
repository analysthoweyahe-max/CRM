import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/modules/auth/context/AuthContext';

import { adminApi } from '../api/admin.api';

import { HR_CREATABLE_MANAGER_ROLES, type CreateAdminPayload } from '../types/adminManager.types';



export function useCreateAdmin() {

  const qc = useQueryClient();

  const { isSuperAdmin } = useAuth();



  return useMutation({

    mutationFn: (payload: CreateAdminPayload) => {

      if (isSuperAdmin) return adminApi.create(payload);



      const allowed = HR_CREATABLE_MANAGER_ROLES as readonly string[];

      const role = allowed.includes(payload.role) ? payload.role : allowed[0];

      return adminApi.create({ name: payload.name, email: payload.email, role });

    },

    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'managers'] }),

  });

}


