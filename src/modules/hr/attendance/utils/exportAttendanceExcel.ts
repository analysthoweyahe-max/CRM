import { downloadTeamExcel } from '@/shared/modules/team/utils/exportTeam';
import { formatDate } from './printAttendance';
import type { AttendanceLogRow, DayStatus } from '../types/attendance.types';

const STATUS_LABEL: Partial<Record<DayStatus, { ar: string; en: string }>> = {
  present:           { ar: 'حاضر',           en: 'Present' },
  normal_day:        { ar: 'يوم عادي',       en: 'Normal Day' },
  late:              { ar: 'متأخر',          en: 'Late' },
  late_arrival:      { ar: 'تأخر',           en: 'Late Arrival' },
  absent:            { ar: 'غائب',           en: 'Absent' },
  leave:             { ar: 'إجازة',          en: 'Leave' },
  early_leave:       { ar: 'انصراف مبكر',    en: 'Early Leave' },
  overtime:          { ar: 'ساعات إضافية',   en: 'Overtime' },
  awaiting_check_in: { ar: 'بانتظار الحضور', en: 'Awaiting Check-in' },
};

function statusLabel(status: DayStatus | '', label: string | undefined, isAr: boolean) {
  if (label) return label;
  const s = status ? STATUS_LABEL[status] : undefined;
  if (!s) return status || '—';
  return isAr ? s.ar : s.en;
}

export function exportAttendanceExcel(
  rows:     AttendanceLogRow[],
  dateFrom: string,
  dateTo:   string,
  isAr:     boolean,
) {
  const headers = isAr
    ? ['التاريخ', 'الموظف', 'القسم', 'وقت الدخول', 'وقت الخروج', 'ساعات العمل', 'الحالة']
    : ['Date', 'Employee', 'Department', 'Check In', 'Check Out', 'Hours', 'Status'];

  const data = rows.map((r) => [
    formatDate(r.date, isAr),
    r.name,
    r.department || '—',
    r.check_in  ?? '—',
    r.check_out ?? '—',
    r.worked_hours ?? '—',
    statusLabel(r.day_status, r.day_status_label, isAr),
  ]);

  const filename = `attendance-log_${dateFrom}_${dateTo}.xls`;
  downloadTeamExcel(headers, data, filename, isAr ? 'سجل الحضور' : 'Attendance Log');
}
