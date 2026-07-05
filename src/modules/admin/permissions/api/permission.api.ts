import { http } from '@/shared/services/http.service';
import type {
  PermissionListResponse,
  PermissionSingleResponse,
  CreatePermissionPayload,
  UpdatePermissionPayload,
  UpdatePermissionResponse,
  DeletePermissionResponse,
} from '../types/adminPermission.types';

export const permissionApi = {
  list(guardName = 'admin') {
    return http.get<PermissionListResponse>('/v1/permissions', { params: { guard_name: guardName } });
  },

  create(payload: CreatePermissionPayload) {
    return http.post<PermissionSingleResponse>('/v1/permissions', payload);
  },

  update(id: number | string, payload: UpdatePermissionPayload) {
    return http.post<UpdatePermissionResponse>(`/v1/permissions/${id}`, payload);
  },

  remove(id: number | string) {
    return http.delete<DeletePermissionResponse>(`/v1/permissions/${id}`);
  },
};
