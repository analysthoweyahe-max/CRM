import type { AxiosResponse } from 'axios';
import { http } from '@/shared/services/http.service';
import { normalizeLeaveList, normalizeLeaveRequest } from '../utils/leave.utils';
import type {
  LeaveListParams,
  LeaveListResponse,
  LeaveSingleResponse,
  LeaveTypesResponse,
  EmployeeLeaveSummaryResponse,
  EmployeeLeaveHistoryParams,
  EmployeeLeaveHistoryResponse,
  ApiLeaveRequest,
} from '../types/leaves.types';

function normalizeListResponse(res: AxiosResponse<LeaveListResponse>): AxiosResponse<LeaveListResponse> {
  const envelope = res.data;
  const page = envelope.data;
  return {
    ...res,
    data: {
      ...envelope,
      data: {
        ...page,
        data: normalizeLeaveList(page.data),
      },
    },
  };
}

function normalizeSingleResponse(res: AxiosResponse<LeaveSingleResponse>): AxiosResponse<LeaveSingleResponse> {
  const envelope = res.data;
  return {
    ...res,
    data: {
      ...envelope,
      data: normalizeLeaveRequest(envelope.data),
    },
  };
}

function normalizeHistoryResponse(res: AxiosResponse<EmployeeLeaveHistoryResponse>): AxiosResponse<EmployeeLeaveHistoryResponse> {
  const envelope = res.data;
  const page = envelope.data;
  return {
    ...res,
    data: {
      ...envelope,
      data: {
        ...page,
        data: normalizeLeaveList(page.data),
      },
    },
  };
}

function extractLeave(res: AxiosResponse<LeaveSingleResponse>): ApiLeaveRequest {
  return normalizeLeaveRequest(res.data.data);
}

export const leavesApi = {
  async list(params?: LeaveListParams) {
    const res = await http.get<LeaveListResponse>('/v1/hr/leave', { params });
    return normalizeListResponse(res);
  },

  async show(id: string) {
    const res = await http.get<LeaveSingleResponse>(`/v1/hr/leave/${id}`, { params: { with: 'employee' } });
    return normalizeSingleResponse(res);
  },

  async approve(id: string, notes?: string) {
    const res = await http.post<LeaveSingleResponse>(`/v1/hr/leave/${id}/approve`, notes ? { notes } : {});
    return normalizeSingleResponse(res);
  },

  async reject(id: string, rejectionReason: string) {
    const res = await http.post<LeaveSingleResponse>(`/v1/hr/leave/${id}/reject`, { rejection_reason: rejectionReason });
    return normalizeSingleResponse(res);
  },

  leaveTypes() {
    return http.get<LeaveTypesResponse>('/v1/hr/leave/lookups/types');
  },

  employeeSummary(employeeId: string) {
    return http.get<EmployeeLeaveSummaryResponse>(`/v1/hr/employees/${employeeId}/leave/summary`);
  },

  async employeeHistory(employeeId: string, params?: EmployeeLeaveHistoryParams) {
    const res = await http.get<EmployeeLeaveHistoryResponse>(`/v1/hr/employees/${employeeId}/leave/history`, { params });
    return normalizeHistoryResponse(res);
  },

  async employeeLeaveDetail(employeeId: string, leaveId: string) {
    const res = await http.get<LeaveSingleResponse>(`/v1/hr/employees/${employeeId}/leave/${leaveId}`);
    return normalizeSingleResponse(res);
  },

  /** Normalized leave payload — use in hooks when only the entity is needed. */
  extractLeave,
};
