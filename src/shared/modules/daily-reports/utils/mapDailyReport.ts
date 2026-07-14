import type {
  DailyReportHistoryItem,
  DailyReportTaskDetail,
  RawDailyReportItem,
  RawDailyReportTask,
} from '../types/dailyReport.types';

function mapTask(raw: RawDailyReportTask): DailyReportTaskDetail {
  const taskId = raw.taskId ?? raw.task_id ?? null;
  return {
    taskId:       typeof taskId === 'number' && taskId > 0 ? taskId : null,
    taskTitle:    raw.taskTitle ?? raw.task_title ?? '',
    plannedHours: Number(raw.plannedHours ?? raw.planned_hours ?? 0),
    actualHours:  Number(raw.actualHours ?? raw.actual_hours ?? 0),
  };
}

export function mapDailyReportHistoryItem(raw: RawDailyReportItem): DailyReportHistoryItem {
  return {
    id:          String(raw.id ?? ''),
    reportDate:  raw.reportDate ?? raw.report_date ?? raw.date ?? '',
    checkInAt:   raw.checkInAt ?? raw.check_in_at ?? '',
    checkOutAt:  raw.checkOutAt ?? raw.check_out_at ?? '',
    summaryNote: raw.summaryNote ?? raw.summary_note ?? '',
    tasks:       (raw.tasks ?? []).map(mapTask),
    submittedAt: raw.submittedAt ?? raw.submitted_at ?? '',
    status:      'completed',
  };
}
