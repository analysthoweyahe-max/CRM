import { http } from '@/shared/services/http.service';
import type {
  LeaveListParams,
  LeaveListResponse,
  LeaveSingleResponse,
  LeaveTypesResponse,
  EmployeeLeaveSummaryResponse,
  EmployeeLeaveHistoryParams,
  EmployeeLeaveHistoryResponse,
} from '../types/leaves.types';

export const leavesApi = {
  list(params?: LeaveListParams) {
    return http.get<LeaveListResponse>('/v1/hr/leave', { params });
  },

  show(id: string) {
    return http.get<LeaveSingleResponse>(`/v1/hr/leave/${id}`);
  },

  approve(id: string, notes?: string) {
    return http.post<LeaveSingleResponse>(`/v1/hr/leave/${id}/approve`, notes ? { notes } : {});
  },

  reject(id: string, rejectionReason: string) {
    return http.post<LeaveSingleResponse>(`/v1/hr/leave/${id}/reject`, { rejection_reason: rejectionReason });
  },

  leaveTypes() {
    return http.get<LeaveTypesResponse>('/v1/hr/leave/lookups/types');
  },

  employeeSummary(employeeId: string) {
    return http.get<EmployeeLeaveSummaryResponse>(`/v1/hr/employees/${employeeId}/leave/summary`);
  },

  employeeHistory(employeeId: string, params?: EmployeeLeaveHistoryParams) {
    return http.get<EmployeeLeaveHistoryResponse>(`/v1/hr/employees/${employeeId}/leave/history`, { params });
  },

  employeeLeaveDetail(employeeId: string, leaveId: string) {
    return http.get<LeaveSingleResponse>(`/v1/hr/employees/${employeeId}/leave/${leaveId}`);
  },
};
