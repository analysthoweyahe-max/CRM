import { http } from '@/shared/services/http.service';
import type {
  CreateExceptionPayload,
  ExceptionListParams,
  ExceptionListResponse,
  ExceptionSingleResponse,
  HrCreateExceptionPayload,
  RejectExceptionPayload,
} from '../types/attendanceException.types';

export const attendanceExceptionApi = {
  /**
   * Self-service exception APIs — permission-gated by `view-attendance` on the backend.
   * Same paths for Employee / PM / SEO portals (do not use role-specific URLs).
   */
  create(payload: CreateExceptionPayload) {
    return http.post<ExceptionSingleResponse>('/v1/employee/attendance/exceptions', payload);
  },

  /** HR / super-admin — create on behalf of an employee */
  hrCreate(payload: HrCreateExceptionPayload) {
    return http.post<ExceptionSingleResponse>('/v1/hr/attendance/exceptions', payload);
  },

  /** Self — list own exception requests */
  employeeHistory(params?: ExceptionListParams) {
    return http.get<ExceptionListResponse>('/v1/employee/attendance/exceptions/history', {
      params: { per_page: 15, ...params },
    });
  },

  /** Self — view one */
  employeeShow(uuid: string) {
    return http.get<ExceptionSingleResponse>(`/v1/employee/attendance/exceptions/${uuid}`);
  },

  /** Self — cancel pending */
  cancel(uuid: string) {
    return http.post<ExceptionSingleResponse>(`/v1/employee/attendance/exceptions/${uuid}/cancel`);
  },

  /** HR approve queue — requires `manage-attendance` (not view-attendance). */
  hrList(params?: ExceptionListParams) {
    return http.get<ExceptionListResponse>('/v1/hr/attendance/exceptions', {
      params: { per_page: 15, ...params },
    });
  },

  /** HR — approve (`manage-attendance`) */
  approve(uuid: string) {
    return http.post<ExceptionSingleResponse>(`/v1/hr/attendance/exceptions/${uuid}/approve`);
  },

  /** HR — reject (`manage-attendance`) */
  reject(uuid: string, payload: RejectExceptionPayload) {
    return http.post<ExceptionSingleResponse>(`/v1/hr/attendance/exceptions/${uuid}/reject`, payload);
  },
};
