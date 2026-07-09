import { http } from '@/shared/services/http.service';

import type {
  AssignAdminRolePayload,
  CreateAdminPayload,
  CreateAdminResponse,
  AdminManagerListResponse,
  AdminManagerDetailResponse,
  UpdateAdminPayload,
  UpdateAdminResponse,
  AdminManagerListParams,
} from '../types/adminManager.types';

export const adminApi = {
  list(params: AdminManagerListParams = {}) {
    return http.get<AdminManagerListResponse>('/v1/admins', { params });
  },

  get(id: string) {
    return http.get<AdminManagerDetailResponse>(`/v1/admins/${id}`);
  },

  create(payload: CreateAdminPayload) {
    return http.post<CreateAdminResponse>('/v1/admins', payload);
  },

  update(id: string, payload: UpdateAdminPayload) {
    return http.put<UpdateAdminResponse>(`/v1/admins/${id}`, payload);
  },

  remove(id: string) {
    return http.delete<{ status: string; message: string }>(`/v1/admins/${id}`);
  },

  /** @deprecated Use update() — backend assigns role via PUT /v1/admins/{uuid}. */
  assignRole(id: string, payload: AssignAdminRolePayload) {
    return this.update(id, payload);
  },
};
