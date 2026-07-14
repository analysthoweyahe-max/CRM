export type DayReportStatus = 'completed' | 'pending';

export interface DailyReportTaskDetail {
  taskId:       number | null;
  taskTitle:    string;
  plannedHours: number;
  actualHours:  number;
}

/** Full history row mapped from GET daily reports responses. */
export interface DailyReportHistoryItem {
  id:          string;
  reportDate:  string;
  checkInAt:   string;
  checkOutAt:  string;
  summaryNote: string;
  tasks:       DailyReportTaskDetail[];
  submittedAt: string;
  status:      DayReportStatus;
}

export interface DailyReportTaskOption {
  id:    number;
  title: string;
  meta?: string;
}

export interface DailyReportTaskInput {
  task_id?:      number;
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

/** Raw list item — handles both camelCase and snake_case backends. */
export interface RawDailyReportTask {
  taskId?:        number | null;
  task_id?:       number | null;
  taskTitle?:     string;
  task_title?:    string;
  plannedHours?:  number;
  planned_hours?: number;
  actualHours?:   number;
  actual_hours?:  number;
}

export interface RawDailyReportItem {
  id?:           string | number;
  reportDate?:   string;
  report_date?:  string;
  date?:         string;
  checkInAt?:    string | null;
  check_in_at?:  string | null;
  checkOutAt?:   string | null;
  check_out_at?: string | null;
  summaryNote?:  string | null;
  summary_note?: string | null;
  tasks?:        RawDailyReportTask[];
  submittedAt?:  string;
  submitted_at?: string;
  [key: string]: unknown;
}
