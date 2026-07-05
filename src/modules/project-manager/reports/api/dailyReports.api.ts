import { http } from '@/shared/services/http.service';

export interface RawPmDailyReportTask {
  taskId:       number;
  taskTitle:    string;
  plannedHours: number;
  actualHours:  number;
}

export interface RawPmDailyReportEmployee {
  id:            string;
  name:          string;
  avatarInitial: string;
}

export interface RawPmDailyReport {
  id:          string;
  reportDate:  string;
  checkInAt:   string | null;
  checkOutAt:  string | null;
  summaryNote: string | null;
  employee:    RawPmDailyReportEmployee;
  tasks:       RawPmDailyReportTask[];
  submittedAt: string;
}

export interface PmDailyReportListResponse {
  status:  string;
  message: string;
  data: {
    date:  string;
    data:  RawPmDailyReport[];
    total: number;
  };
}

export const pmDailyReportsApi = {
  list(date: string) {
    return http.get<PmDailyReportListResponse>('/v1/pm/reports/daily', { params: { date } });
  },
};
