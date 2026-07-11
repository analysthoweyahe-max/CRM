import { http } from '@/shared/services/http.service';
import type { PermissionListResponse } from '../types/adminPermission.types';

export const permissionApi = {
  list(guardName = 'admin') {
    return http.get<PermissionListResponse>('/v1/permissions', { params: { guard_name: guardName } });
  },
};
