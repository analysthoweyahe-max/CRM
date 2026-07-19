import { http } from '@/shared/services/http.service';
import type {
  DailyAttendanceResponse,
  DailyAttendanceParams,
  AttendanceRecentResponse,
  AttendanceHistoryResponse,
  AttendanceHistoryParams,
  EmployeeTodayAttendanceResponse,
  EmployeeCheckInResponse,
  EmployeeCheckOutResponse,
  EmployeeSelfHistoryParams,
} from '../types/attendance.types';

export const attendanceApi = {
  daily(params?: DailyAttendanceParams) {
    return http.get<DailyAttendanceResponse>('/v1/hr/attendance/daily', { params });
  },

  /** HR-only — requires `manage-attendance`. Never call from self portals. */
  employeeRecent(employeeId: string) {
    return http.get<AttendanceRecentResponse>(
      `/v1/hr/employees/${employeeId}/attendance/recent`,
    );
  },

  /** HR-only — requires `manage-attendance`. Never call from self portals. */
  employeeHistory(employeeId: string, params?: AttendanceHistoryParams) {
    return http.get<AttendanceHistoryResponse>(
      `/v1/hr/employees/${employeeId}/attendance/history`,
      { params },
    );
  },

  employeeToday() {
    return http.get<EmployeeTodayAttendanceResponse>('/v1/employee/attendance/today');
  },

  employeeCheckIn() {
    return http.post<EmployeeCheckInResponse>('/v1/employee/attendance/check-in');
  },

  employeeCheckOut() {
    return http.post<EmployeeCheckOutResponse>('/v1/employee/attendance/check-out');
  },

  employeeSelfRecent() {
    return http.get<AttendanceRecentResponse>('/v1/employee/attendance/recent');
  },

  /** Self history for the employee portal — PM/SEO use attendanceTimerApi with scope paths. */
  employeeSelfHistory(params?: EmployeeSelfHistoryParams) {
    return http.get<AttendanceHistoryResponse>('/v1/employee/attendance/history', { params });
  },
};
