import { http } from '@/shared/services/http.service';

/* Confirmed via a real (empty) response: this is a plain paginated list
 * ({data, current_page, last_page, total}) — NOT date-grouped like
 * GET /v1/pm/reports/daily (which wraps in {date, data, total}). The item
 * shape below is still unconfirmed (no populated example seen yet). */
export interface RawSeoDailyReportTask {
  taskId:       number;
  taskTitle:    string;
  plannedHours: number;
  actualHours:  number;
}

export interface RawSeoDailyReportEmployee {
  id:            string;
  name:          string;
  avatarInitial: string;
}

export interface RawSeoDailyReport {
  id:          string;
  reportDate:  string;
  checkInAt:   string | null;
  checkOutAt:  string | null;
  summaryNote: string | null;
  employee:    RawSeoDailyReportEmployee;
  tasks:       RawSeoDailyReportTask[];
  submittedAt: string;
}

export interface SeoDailyReportListResponse {
  status:  string;
  message: string;
  data: {
    data:         RawSeoDailyReport[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export const seoDailyReportsApi = {
  list(date: string) {
    return http.get<SeoDailyReportListResponse>('/v1/seo/reports/daily', { params: { date } });
  },
};
