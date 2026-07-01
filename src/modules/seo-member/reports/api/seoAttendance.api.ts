import { http } from '@/shared/services/http.service';
import type {
  SeoAttendanceSummaryResponse,
  SeoAttendanceHistoryResponse,
} from '../types/seoAttendance.types';

export const seoAttendanceApi = {
  summary(month: string) {
    return http.get<SeoAttendanceSummaryResponse>('/v1/seo/attendance/summary', { params: { month } });
  },

  history(params: { date_from: string; date_to: string; per_page?: number }) {
    return http.get<SeoAttendanceHistoryResponse>('/v1/seo/attendance/history', { params });
  },
};
