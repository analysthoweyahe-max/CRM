import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../api/admin.api';
import type { CreateAdminPayload } from '../types/adminManager.types';

export function useCreateAdmin() {
  return useMutation({
    mutationFn: (payload: CreateAdminPayload) => adminApi.create(payload),
  });
}
