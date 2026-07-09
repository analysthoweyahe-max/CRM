import type { ApiLeaveEmployee, ApiLeaveRequest } from '../types/leaves.types';

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

export function calcLeaveDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end   = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff + 1);
}

function normalizeLeaveEmployee(raw: unknown, preferAr = false): ApiLeaveEmployee | null {
  const record = readRecord(raw);
  if (!record) return null;

  const id = readString(record.id, record.employee_id, record.employeeId);
  const name = readString(
    record.name,
    record.full_name,
    record.fullName,
    record.employee_name,
    record.employeeName,
  );
  if (!id && !name) return null;

  return {
    id:         id || name,
    name,
    number:     readString(record.number, record.employee_number, record.employeeNumber) || undefined,
    department: lookupLabel(record.department ?? record.employee_department ?? record.employeeDepartment, preferAr),
    job_title:  lookupLabel(
      record.job_title ?? record.jobTitle ?? record.employee_job_title ?? record.employeeJobTitle,
      preferAr,
    ),
  };
}

function parseLeaveStatus(record: Record<string, unknown>): ApiLeaveRequest['status'] {
  const raw = record.status;
  const nested = readRecord(raw);
  const slug = readString(
    raw,
    nested?.value,
    nested?.key,
    nested?.slug,
    nested?.name,
  ).toLowerCase();

  if (slug === 'approved' || slug === 'rejected' || slug === 'pending') {
    return slug;
  }

  const label = lookupLabel(raw).toLowerCase();
  if (/approv|موافق/.test(label)) return 'approved';
  if (/reject|مرفوض/.test(label)) return 'rejected';
  if (/pend|انتظار|معلق/.test(label)) return 'pending';
  return 'pending';
}

/** Normalize HR leave payloads that may arrive in camelCase or with nested employee/period shapes. */
export function normalizeLeaveRequest(raw: unknown, preferAr = false): ApiLeaveRequest {
  let record = readRecord(raw) ?? {};

  // Some endpoints double-wrap: { data: { ...leave } } or { leave: { ... } }
  const nestedData = readRecord(record.data);
  const nestedLeave = readRecord(record.leave);
  if (nestedData && readString(nestedData.id, nestedData.uuid, nestedData.leave_id, nestedData.leaveId)) {
    record = nestedData;
  } else if (nestedLeave && readString(nestedLeave.id, nestedLeave.uuid, nestedLeave.leave_id, nestedLeave.leaveId)) {
    record = nestedLeave;
  }

  const period = readRecord(record.period);

  const employee = normalizeLeaveEmployee(
    record.employee ?? record.applicant ?? record.employee_data ?? record.employeeData,
    preferAr,
  );

  const startDate = readString(
    record.start_date,
    record.startDate,
    record.from,
    record.date_from,
    record.dateFrom,
    period?.startDate,
    period?.start_date,
    period?.from,
  );
  const endDate = readString(
    record.end_date,
    record.endDate,
    record.to,
    record.date_to,
    record.dateTo,
    period?.endDate,
    period?.end_date,
    period?.to,
  );

  let daysCount = Number(
    record.days_count ?? record.daysCount ?? record.duration_days ?? record.durationDays
    ?? record.duration ?? period?.daysCount ?? period?.days_count ?? period?.duration ?? 0,
  );
  if (!Number.isFinite(daysCount) || daysCount <= 0) daysCount = 0;
  if (!daysCount && startDate && endDate) {
    daysCount = calcLeaveDays(startDate, endDate);
  }

  const employeeName = readString(
    record.employee_name,
    record.employeeName,
    employee?.name,
  );

  const status = parseLeaveStatus(record);

  return {
    id:               readString(record.id, record.uuid, record.leave_id, record.leaveId),
    employee:         employee ?? (employeeName ? {
      id:         readString(record.employee_id, record.employeeId, employeeName),
      name:       employeeName,
      department: lookupLabel(record.employee_department ?? record.employeeDepartment, preferAr),
      job_title:  lookupLabel(record.employee_job_title ?? record.employeeJobTitle, preferAr),
    } : null),
    employee_name:      employeeName || undefined,
    employee_department: lookupLabel(record.employee_department ?? record.employeeDepartment, preferAr) || undefined,
    employee_job_title:  lookupLabel(record.employee_job_title ?? record.employeeJobTitle, preferAr) || undefined,
    leave_type:       readString(record.leave_type, record.leaveType) || lookupLabel(record.leave_type ?? record.leaveType, preferAr),
    leave_type_label: readString(
      record.leave_type_label,
      record.leaveTypeLabel,
      record.type_label,
      record.typeLabel,
    ) || lookupLabel(record.leave_type ?? record.leaveType, preferAr),
    start_date:       startDate,
    end_date:         endDate,
    days_count:       daysCount,
    request_date:     readString(
      record.request_date,
      record.requestDate,
      record.request_submitted_at,
      record.requestSubmittedAt,
      record.submitted_at,
      record.submittedAt,
      record.created_at,
      record.createdAt,
    ),
    status:           status,
    reason:           readString(record.reason, record.description, record.content),
    rejection_reason: readString(record.rejection_reason, record.rejectionReason) || undefined,
    notes:            readString(record.notes, record.note) || undefined,
    approved_at:      readString(
      record.approved_at,
      record.approvedAt,
      record.reviewed_at,
      record.reviewedAt,
      status === 'approved' ? record.updated_at : undefined,
      status === 'approved' ? record.updatedAt : undefined,
    ) || undefined,
    attachment:       (() => {
      const attachment = readRecord(record.attachment);
      if (!attachment) return undefined;
      return {
        name: readString(attachment.name),
        size: Number(attachment.size ?? 0),
        url:  readString(attachment.url),
      };
    })(),
  };
}

export function normalizeLeaveList(items: unknown, preferAr = false): ApiLeaveRequest[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => normalizeLeaveRequest(item, preferAr));
}

export function getLeaveEmployeeName(row: ApiLeaveRequest): string {
  return row.employee?.name ?? row.employee_name ?? '';
}

export function getLeaveEmployeeDepartment(row: ApiLeaveRequest, isAr = false): string {
  const fromEmployee = row.employee?.department;
  if (fromEmployee) return fromEmployee;
  return row.employee_department ?? (isAr ? '' : '');
}

export function formatLeaveDuration(daysCount: number | null | undefined, isAr: boolean): string {
  const days = Number(daysCount);
  if (!Number.isFinite(days) || days <= 0) return '—';
  if (isAr) return `${days} ${days === 1 ? 'يوم' : 'أيام'}`;
  return `${days} ${days === 1 ? 'day' : 'days'}`;
}
