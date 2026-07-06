import { http } from '@/shared/services/http.service';
import type {
  EmpLeaveTypesResponse,
  EmpLeaveListResponse,
  EmpLeaveSummaryResponse,
  EmpLeaveCreateResponse,
  EmpLeaveCreatePayload,
  EmpLeaveDetailResponse,
} from '../types/employeeLeave.types';

export const empLeaveApi = {
  summary() {
    return http.get<EmpLeaveSummaryResponse>('/v1/employee/leave/summary');
  },

  types() {
    return http.get<EmpLeaveTypesResponse>('/v1/employee/leave/lookups/types');
  },

  history(params?: { per_page?: number; page?: number }) {
    return http.get<EmpLeaveListResponse>('/v1/employee/leave/history', {
      params: { per_page: 15, ...params },
    });
  },

  list(params?: { per_page?: number; page?: number }) {
    return this.history(params);
  },

  create(payload: EmpLeaveCreatePayload) {
    return http.post<EmpLeaveCreateResponse>('/v1/employee/leave', payload);
  },

  show(uuid: string) {
    return http.get<EmpLeaveDetailResponse>(`/v1/employee/leave/${uuid}`);
  },
};
