import type { AppNotification } from '@/shared/types/notification.types';
import type { Role } from '@/shared/types/role.types';
import { formatDateShort } from '@/shared/utils/date.utils';
import { calcLeaveDays } from '@/modules/hr/leaves/utils/leave.utils';

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function readString(...values: unknown[]): string {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string' || typeof value === 'number') {
      const text = String(value).trim();
      if (text) return text;
    }
  }
  return '';
}

function parseData(raw: AppNotification['data']): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return parseData(JSON.parse(raw) as AppNotification['data']);
    } catch {
      return {};
    }
  }
  return raw;
}

function lookupLabel(value: unknown, preferAr = false): string {
  if (!value) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  const record = readRecord(value);
  if (!record) return '';
  if (preferAr) {
    const ar = readString(record.nameAr, record.name_ar, record.label_ar, record.labelAr);
    if (ar) return ar;
  }
  return readString(record.name, record.label, record.title);
}

export function isLeaveNotificationType(type: string): boolean {
  return (
    type === 'hr_leave_submitted'
    || type === 'hr_leave_status_updated'
    || type === 'leave'
    || /leave/i.test(type)
  );
}

export function isAttendanceExceptionNotificationType(type: string): boolean {
  return (
    type === 'hr_attendance_exception_submitted'
    || type === 'hr_attendance_exception_status_updated'
    || /attendance.?exception/i.test(type)
  );
}

function extractLeaveContext(notification: AppNotification, isAr: boolean) {
  const data = parseData(notification.data);
  const employee = readRecord(data.employee ?? data.applicant);

  const employeeName = readString(
    data.employee_name,
    data.employeeName,
    employee?.name,
    employee?.full_name,
    employee?.fullName,
  );

  const leaveType = readString(
    data.leave_type_label,
    data.leaveTypeLabel,
    data.leave_type,
    data.leaveType,
  );

  const startDate = readString(data.start_date, data.startDate);
  const endDate   = readString(data.end_date, data.endDate);
  const requestDate = readString(
    data.request_date,
    data.requestDate,
    data.created_at,
    data.createdAt,
  );

  let daysCount = Number(data.days_count ?? data.daysCount ?? 0);
  if (!daysCount && startDate && endDate) {
    daysCount = calcLeaveDays(startDate, endDate);
  }

  const department = lookupLabel(
    data.employee_department ?? data.employeeDepartment ?? employee?.department,
    isAr,
  );

  return { employeeName, leaveType, startDate, endDate, requestDate, daysCount, department };
}

export function getNotificationDisplayText(
  notification: AppNotification,
  isAr: boolean,
  _role?: Role,
): { title: string; body: string } {
  const type = notification.type ?? '';
  const data = parseData(notification.data);
  const title = notification.title?.trim();
  const body  = notification.body?.trim();

  if (type === 'leave') {
    return {
      title: title || (isAr ? 'تحديث حالة إجازتك' : 'Your leave status was updated'),
      body:  body  || '',
    };
  }

  if (!isLeaveNotificationType(type) && !/leave|إجاز/.test(`${title} ${body}`)) {
    return {
      title: title || (isAr ? 'إشعار جديد' : 'New notification'),
      body:  body  || '',
    };
  }

  const ctx = extractLeaveContext(notification, isAr);

  const resolvedTitle = title || (isAr ? 'طلب إجازة جديد' : 'New leave request');

  if (body) {
    return { title: resolvedTitle, body };
  }

  const parts: string[] = [];

  if (ctx.employeeName) {
    parts.push(
      isAr
        ? `قام ${ctx.employeeName} بتقديم طلب إجازة`
        : `${ctx.employeeName} submitted a leave request`,
    );
  } else {
    parts.push(isAr ? 'تم تقديم طلب إجازة جديد' : 'A new leave request was submitted');
  }

  if (ctx.leaveType) {
    parts.push(isAr ? `النوع: ${ctx.leaveType}` : `Type: ${ctx.leaveType}`);
  }

  if (ctx.startDate && ctx.endDate) {
    const period = `${formatDateShort(ctx.startDate, isAr)} – ${formatDateShort(ctx.endDate, isAr)}`;
    parts.push(isAr ? `الفترة: ${period}` : `Period: ${period}`);
  }

  if (ctx.daysCount) {
    parts.push(
      isAr
        ? `المدة: ${ctx.daysCount} ${ctx.daysCount === 1 ? 'يوم' : 'أيام'}`
        : `Duration: ${ctx.daysCount} ${ctx.daysCount === 1 ? 'day' : 'days'}`,
    );
  }

  if (ctx.requestDate) {
    parts.push(
      isAr
        ? `تاريخ الطلب: ${formatDateShort(ctx.requestDate, isAr)}`
        : `Requested: ${formatDateShort(ctx.requestDate, isAr)}`,
    );
  }

  if (ctx.department) {
    parts.push(isAr ? `القسم: ${ctx.department}` : `Department: ${ctx.department}`);
  }

  const reason = readString(data.reason, data.description);
  if (reason) {
    parts.push(isAr ? `السبب: ${reason}` : `Reason: ${reason}`);
  }

  return {
    title: resolvedTitle,
    body:  parts.join(' · '),
  };
}

export function enrichLeaveNotification(
  notification: AppNotification,
  isAr = false,
  role?: Role,
): AppNotification {
  const display = getNotificationDisplayText(notification, isAr, role);
  return {
    ...notification,
    title: display.title,
    body:  display.body,
  };
}
