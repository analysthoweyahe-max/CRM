import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import type { CreateAdminPayload } from '../types/adminManager.types';

export function useCreateAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => adminApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin', 'managers', 'list'] }),
  });
}
