import { http } from '@/shared/services/http.service';
import type { CreateAdminPayload, CreateAdminResponse } from '../types/adminManager.types';

export const adminApi = {
  create(payload: CreateAdminPayload) {
    return http.post<CreateAdminResponse>('/v1/admins', payload);
  },
};
