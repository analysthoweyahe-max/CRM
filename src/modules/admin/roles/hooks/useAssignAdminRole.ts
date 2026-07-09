import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/modules/auth/context/AuthContext';

import { adminApi } from '../api/admin.api';

import type { UpdateAdminPayload } from '../types/adminManager.types';



export function useUpdateAdmin() {

  const qc = useQueryClient();

  const { user, refreshUser } = useAuth();



  return useMutation({

    mutationFn: ({ id, payload }: { id: string; payload: UpdateAdminPayload }) =>

      adminApi.update(id, payload),

    onSuccess: async (_data, { id }) => {

      await qc.invalidateQueries({ queryKey: ['admin', 'managers'] });

      if (user?.id === id) {

        await refreshUser();

      }

    },

  });

}



/** @deprecated Prefer useUpdateAdmin */

export function useAssignAdminRole() {

  return useUpdateAdmin();

}


