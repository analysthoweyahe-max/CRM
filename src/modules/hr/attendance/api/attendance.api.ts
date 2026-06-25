import { http } from '@/shared/services/http.service';
import type {
  DailyAttendanceResponse,
  DailyAttendanceParams,
  AttendanceRecentResponse,
  AttendanceHistoryResponse,
  AttendanceHistoryParams,
} from '../types/attendance.types';

export const attendanceApi = {
  daily(params?: DailyAttendanceParams) {
    return http.get<DailyAttendanceResponse>('/v1/hr/attendance/daily', { params });
  },

  employeeRecent(employeeId: string) {
    return http.get<AttendanceRecentResponse>(
      `/v1/hr/employees/${employeeId}/attendance/recent`,
    );
  },

  employeeHistory(employeeId: string, params?: AttendanceHistoryParams) {
    return http.get<AttendanceHistoryResponse>(
      `/v1/hr/employees/${employeeId}/attendance/history`,
      { params },
    );
  },
};
