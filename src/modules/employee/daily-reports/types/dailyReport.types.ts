export type DailyReportStatus = 'submitted' | 'approved' | 'rejected';

export interface DailyReport {
  id:           string;
  date:         string;
  title:        string;
  description:  string;
  hours_worked: number;
  status:       DailyReportStatus;
  feedback?:    string;
}

export interface DailyReportListResponse {
  status: string;
  data:   { data: DailyReport[] };
}

export interface DailyReportCreateResponse {
  status:  string;
  message: string;
  data:    DailyReport;
}
