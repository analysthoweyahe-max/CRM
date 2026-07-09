import { http } from '@/shared/services/http.service';
import type { AttendanceScope, AttendanceTodayResponse, AttendanceHistoryResponse, AttendanceSummaryResponse } from '../types/attendanceTimer.types';
import {
  attendanceHistoryPath,
  attendanceSummaryPath,
  attendanceTodayPath,
  normalizeApiPath,
} from '../utils/attendanceTimer.utils';

export const attendanceTimerApi = {
  today(scope: AttendanceScope, url?: string) {
    const path = url ? normalizeApiPath(url) : attendanceTodayPath(scope);
    return http.get<AttendanceTodayResponse>(path);
  },

  action(url: string) {
    return http.post<AttendanceTodayResponse>(normalizeApiPath(url));
  },

  history(scope: AttendanceScope, params: { month: string; per_page?: number }, url?: string) {
    const path = url ? normalizeApiPath(url) : attendanceHistoryPath(scope);
    return http.get<AttendanceHistoryResponse>(path, { params });
  },

  summary(scope: AttendanceScope, month: string) {
    return http.get<AttendanceSummaryResponse>(attendanceSummaryPath(scope), { params: { month } });
  },
};
