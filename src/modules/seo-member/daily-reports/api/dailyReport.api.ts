import { http } from '@/shared/services/http.service';
import type {
  DailyReportListResponse,
  DailyReportCreateResponse,
  CreateDailyReportPayload,
} from '../types/dailyReport.types';

export const seoDailyReportApi = {
  list(params: { date_from?: string; date_to?: string } = {}) {
    return http.get<DailyReportListResponse>('/v1/seo/employee/reports/daily', { params });
  },

  create(payload: CreateDailyReportPayload) {
    return http.post<DailyReportCreateResponse>('/v1/seo/employee/reports/daily', payload);
  },
};
