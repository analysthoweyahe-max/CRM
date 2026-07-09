import { http } from '@/shared/services/http.service';
import type {
  CreateExceptionPayload,
  ExceptionListParams,
  ExceptionListResponse,
  ExceptionSingleResponse,
  RejectExceptionPayload,
} from '../types/attendanceException.types';

export const attendanceExceptionApi = {
  /** Employee — submit */
  create(payload: CreateExceptionPayload) {
    return http.post<ExceptionSingleResponse>('/v1/employee/attendance/exceptions', payload);
  },

  /** Employee — list own */
  employeeHistory(params?: ExceptionListParams) {
    return http.get<ExceptionListResponse>('/v1/employee/attendance/exceptions/history', {
      params: { per_page: 15, ...params },
    });
  },

  /** Employee — view one */
  employeeShow(uuid: string) {
    return http.get<ExceptionSingleResponse>(`/v1/employee/attendance/exceptions/${uuid}`);
  },

  /** Employee — cancel pending */
  cancel(uuid: string) {
    return http.post<ExceptionSingleResponse>(`/v1/employee/attendance/exceptions/${uuid}/cancel`);
  },

  /** HR — list all */
  hrList(params?: ExceptionListParams) {
    return http.get<ExceptionListResponse>('/v1/hr/attendance/exceptions', {
      params: { per_page: 15, ...params },
    });
  },

  /** HR — approve */
  approve(uuid: string) {
    return http.post<ExceptionSingleResponse>(`/v1/hr/attendance/exceptions/${uuid}/approve`);
  },

  /** HR — reject */
  reject(uuid: string, payload: RejectExceptionPayload) {
    return http.post<ExceptionSingleResponse>(`/v1/hr/attendance/exceptions/${uuid}/reject`, payload);
  },
};
