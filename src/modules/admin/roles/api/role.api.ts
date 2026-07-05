import { http } from '@/shared/services/http.service';
import type {
  RoleListResponse,
  RoleSingleResponse,
  CreateRolePayload,
  UpdateRolePayload,
  UpdateRoleResponse,
  DeleteRoleResponse,
} from '../types/adminRole.types';

export const roleApi = {
  list(guardName = 'admin') {
    return http.get<RoleListResponse>('/v1/roles', { params: { guard_name: guardName } });
  },

  create(payload: CreateRolePayload) {
    return http.post<RoleSingleResponse>('/v1/roles', payload);
  },

  update(id: number | string, payload: UpdateRolePayload) {
    return http.post<UpdateRoleResponse>(`/v1/roles/${id}`, payload);
  },

  remove(id: number | string) {
    return http.delete<DeleteRoleResponse>(`/v1/roles/${id}`);
  },
};
