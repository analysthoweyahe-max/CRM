export type DayReportStatus = 'completed' | 'pending';

export interface DayHistoryItem {
  id:     string;
  date:   string;
  status: DayReportStatus;
}

export interface DailyReportTaskInput {
  task_title:    string;
  planned_hours: number;
  actual_hours:  number;
}

export interface CreateDailyReportPayload {
  report_date:  string;
  check_in_at:  string;
  check_out_at: string;
  summary_note: string;
  tasks:        DailyReportTaskInput[];
}

/* ── Raw backend shapes — unconfirmed item shape (only an empty list has been
 * seen so far); mapped defensively in the hook so unexpected field names
 * degrade gracefully instead of crashing. ── */
export interface RawDailyReportItem {
  id?:          string | number;
  reportDate?:  string;
  report_date?: string;
  date?:        string;
  [key: string]: unknown;
}

export interface DailyReportListResponse {
  status:  string;
  message: string;
  data: {
    data:         RawDailyReportItem[];
    current_page: number;
    last_page:    number;
    total:        number;
  };
}

export interface DailyReportCreateResponse {
  status:  string;
  message: string;
  data:    RawDailyReportItem;
}
