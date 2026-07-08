import { http } from '@/shared/services/http.service';
import type {
  CreateAdminPayload,
  CreateAdminResponse,
  AdminManagerListResponse,
} from '../types/adminManager.types';

export const adminApi = {
  list(params: { page?: number; per_page?: number } = {}) {
    return http.get<AdminManagerListResponse>('/v1/admins', { params });
  },

  create(payload: CreateAdminPayload) {
    return http.post<CreateAdminResponse>('/v1/admins', payload);
  },

  remove(id: string) {
    return http.delete<{ status: string; message: string }>(`/v1/admins/${id}`);
  },
};
