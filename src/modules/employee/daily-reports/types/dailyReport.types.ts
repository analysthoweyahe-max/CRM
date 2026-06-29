export type DailyReportStatus = 'submitted' | 'approved' | 'rejected';
export type DayReportStatus   = 'completed' | 'pending';

export interface DailyReport {
  id: string; date: string; title: string;
  description: string; hours_worked: number;
  status: DailyReportStatus; feedback?: string;
}

export interface DayHistoryItem { id: string; date: string; status: DayReportStatus; }
export interface PlannedTask    { id: string; name: string; }
export interface WorkedTask     { id: string; name: string; actualHours: number; }

export interface StartDayPayload { tasks: { id: string; hours: number }[]; notes: string; }
export interface EndDayPayload   { tasks: { id: string; hours: number }[]; reflection: string; }

export interface WeeklyRow {
  taskId: string; taskName: string;
  sat: number | null; sun: number | null; mon: number | null;
  tue: number | null; wed: number | null; thu: number | null;
  fri: number | null; total: number;
}

export interface DailyReportListResponse   { status: string; data: { data: DailyReport[] } }
export interface DailyReportCreateResponse { status: string; message: string; data: DailyReport }
export interface HistoryListResponse       { status: string; data: { data: DayHistoryItem[] } }
export interface PlannedTasksResponse      { status: string; data: { data: PlannedTask[] } }
export interface WorkedTasksResponse       { status: string; data: { data: WorkedTask[] } }
export interface WeeklyDataResponse        { status: string; data: { data: WeeklyRow[] } }
