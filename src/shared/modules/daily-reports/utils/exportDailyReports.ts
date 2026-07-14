import { downloadTeamExcel } from '@/shared/modules/team/utils/exportTeam';
import type { DailyReportHistoryItem } from '../types/dailyReport.types';
import type { DailyReport } from '@/shared/modules/team-reports/types/teamReport.types';

function escapeXml(v: string | number): string | number {
  if (typeof v === 'number') return v;
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function downloadSafe(
  headers: string[],
  rows: (string | number)[][],
  filename: string,
  sheetName: string,
) {
  downloadTeamExcel(
    headers.map(h => String(escapeXml(h))),
    rows.map(r => r.map(escapeXml)),
    filename,
    sheetName,
  );
}

export function exportHistoryReport(
  report: DailyReportHistoryItem,
  isAr: boolean,
) {
  const headers = isAr
    ? ['المهمة', 'مخطط (س)', 'فعلي (س)']
    : ['Task', 'Planned (h)', 'Actual (h)'];

  const rows: (string | number)[][] = report.tasks.map(t => [
    t.taskTitle,
    t.plannedHours,
    t.actualHours,
  ]);

  if (report.summaryNote) {
    rows.push([]);
    rows.push([isAr ? 'ملخص' : 'Summary', report.summaryNote, '']);
  }

  const date = report.reportDate || 'report';
  downloadSafe(
    headers,
    rows,
    `daily-report-${date}.xls`,
    isAr ? 'تقرير يومي' : 'Daily Report',
  );
}

export function exportHistoryTable(
  reports: DailyReportHistoryItem[],
  isAr: boolean,
) {
  const headers = isAr
    ? ['التاريخ', 'حضور', 'انصراف', 'المهمة', 'مخطط (س)', 'فعلي (س)', 'الملخص', 'وقت الإرسال']
    : ['Date', 'Check-in', 'Check-out', 'Task', 'Planned (h)', 'Actual (h)', 'Summary', 'Submitted'];

  const rows: (string | number)[][] = [];
  for (const r of reports) {
    if (r.tasks.length === 0) {
      rows.push([
        r.reportDate,
        r.checkInAt,
        r.checkOutAt,
        '',
        0,
        0,
        r.summaryNote,
        r.submittedAt,
      ]);
      continue;
    }
    r.tasks.forEach((t, i) => {
      rows.push([
        i === 0 ? r.reportDate : '',
        i === 0 ? r.checkInAt : '',
        i === 0 ? r.checkOutAt : '',
        t.taskTitle,
        t.plannedHours,
        t.actualHours,
        i === 0 ? r.summaryNote : '',
        i === 0 ? r.submittedAt : '',
      ]);
    });
  }

  downloadSafe(
    headers,
    rows,
    'daily-reports.xls',
    isAr ? 'التقارير اليومية' : 'Daily Reports',
  );
}

/** Manager team-view: export one member report. */
export function exportTeamReport(report: DailyReport, isAr: boolean) {
  const headers = isAr
    ? ['العضو', 'التاريخ', 'حضور', 'انصراف', 'المهمة', 'مخطط (س)', 'فعلي (س)', 'ملاحظات']
    : ['Member', 'Date', 'Check-in', 'Check-out', 'Task', 'Planned (h)', 'Actual (h)', 'Notes'];

  const planned = report.entry.plannedHours;
  const actual  = report.entry.actualHours;
  const rows = report.entry.tasks.map((task, i) => [
    i === 0 ? report.memberName : '',
    i === 0 ? report.date : '',
    i === 0 ? report.checkIn : '',
    i === 0 ? report.checkOut : '',
    task,
    i === 0 ? planned : '',
    i === 0 ? actual : '',
    i === 0 ? report.notes : '',
  ]);

  downloadSafe(
    headers,
    rows.length ? rows : [[report.memberName, report.date, report.checkIn, report.checkOut, '', planned, actual, report.notes]],
    `daily-report-${report.memberName}-${report.date}.xls`,
    isAr ? 'تقرير يومي' : 'Daily Report',
  );
}

/** Manager team-view: export all reports for the selected date. */
export function exportTeamReportsTable(reports: DailyReport[], date: string, isAr: boolean) {
  const headers = isAr
    ? ['العضو', 'حضور', 'انصراف', 'المهام', 'مخطط (س)', 'فعلي (س)', 'ملاحظات']
    : ['Member', 'Check-in', 'Check-out', 'Tasks', 'Planned (h)', 'Actual (h)', 'Notes'];

  const rows = reports.map(r => [
    r.memberName,
    r.checkIn,
    r.checkOut,
    r.entry.tasks.join(', '),
    r.entry.plannedHours,
    r.entry.actualHours,
    r.notes,
  ]);

  downloadSafe(
    headers,
    rows,
    `team-daily-reports-${date || 'export'}.xls`,
    isAr ? 'تقارير الفريق' : 'Team Reports',
  );
}
