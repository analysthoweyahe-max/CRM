import type {
  AdminRequest,
  AdminRequestActions,
  AdminRequestEmployee,
  AdminRequestStatus,
  AdminRequestType,
} from '../types/adminRequest.types';

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
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

/** Map backend status aliases → canonical UI / filter keys. */
export function normalizeAdminRequestStatus(raw: unknown): AdminRequestStatus {
  const value = asRecord(raw);
  const s = readString(
    typeof raw === 'string' || typeof raw === 'number' ? raw : undefined,
    value?.value,
    value?.key,
    value?.status,
    value?.name,
  ).toLowerCase().replace(/[\s-]+/g, '_');

  const map: Record<string, AdminRequestStatus> = {
    pending:      'pending',
    under_review: 'pending',
    in_review:    'pending',
    waiting:      'pending',
    submitted:    'pending',
    approved:     'approved',
    approve:      'approved',
    accepted:     'approved',
    accept:       'approved',
    rejected:     'rejected',
    reject:       'rejected',
    declined:     'rejected',
    decline:      'rejected',
    denied:       'rejected',
    refuse:       'rejected',
    refused:      'rejected',
    cancelled:    'cancelled',
    canceled:     'cancelled',
    cancel:       'cancelled',
  };

  if (map[s]) return map[s];

  // Arabic labels sometimes arrive as the status itself.
  if (/موافق|مقبول|اعتماد/.test(s)) return 'approved';
  if (/مرفوض|رفض/.test(s)) return 'rejected';
  if (/ملغ|إلغاء|الغاء/.test(s)) return 'cancelled';
  if (/مراجع|انتظار|معلق/.test(s)) return 'pending';

  return 'pending';
}

function normalizeEmployee(raw: unknown): AdminRequestEmployee {
  const emp = asRecord(raw) ?? {};
  const name = readString(emp.name, emp.full_name, emp.fullName) || '—';
  const initial = readString(emp.avatarInitial, emp.avatar_initial)
    || name.charAt(0).toUpperCase();

  return {
    id:            readString(emp.id) || '',
    name,
    department:    readString(emp.department, emp.department_name, emp.departmentName),
    avatarInitial: initial,
  };
}

function normalizeActions(raw: unknown, status: AdminRequestStatus): AdminRequestActions {
  const a = asRecord(raw) ?? {};
  const pending = status === 'pending';
  return {
    canApprove: Boolean(a.canApprove ?? a.can_approve ?? pending),
    canReject:  Boolean(a.canReject  ?? a.can_reject  ?? pending),
    canCancel:  Boolean(a.canCancel  ?? a.can_cancel  ?? pending),
    approveUrl: (a.approveUrl ?? a.approve_url ?? null) as string | null,
    rejectUrl:  (a.rejectUrl  ?? a.reject_url  ?? null) as string | null,
    cancelUrl:  (a.cancelUrl  ?? a.cancel_url  ?? null) as string | null,
  };
}

/** Normalize one admin-request row (camelCase or snake_case, status aliases). */
export function normalizeAdminRequest(raw: unknown): AdminRequest | null {
  const r = asRecord(raw);
  if (!r) return null;

  const id = readString(r.id);
  if (!id) return null;

  const status = normalizeAdminRequestStatus(r.status ?? r.status_key ?? r.statusKey);

  return {
    id,
    requestType:      (readString(r.requestType, r.request_type) || 'other') as AdminRequestType | string,
    requestTypeLabel: readString(r.requestTypeLabel, r.request_type_label, r.requestType, r.request_type) || '—',
    title:            readString(r.title) || '—',
    description:      readString(r.description) || null,
    requestDate:      readString(r.requestDate, r.request_date) || null,
    startDate:        readString(r.startDate, r.start_date) || null,
    endDate:          readString(r.endDate, r.end_date) || null,
    submittedAt:      readString(r.submittedAt, r.submitted_at, r.createdAt, r.created_at) || '—',
    status,
    statusLabel:      readString(r.statusLabel, r.status_label) || status,
    reviewerComment:  readString(r.reviewerComment, r.reviewer_comment, r.comment) || null,
    reviewedAt:       readString(r.reviewedAt, r.reviewed_at) || null,
    employee:         normalizeEmployee(r.employee ?? r.user ?? r.member),
    actions:          normalizeActions(r.actions, status),
  };
}

export function normalizeAdminRequestList(payload: unknown): AdminRequest[] {
  const root = asRecord(payload);
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(root?.data)
      ? root!.data
      : Array.isArray(asRecord(root?.data)?.data)
        ? (asRecord(root!.data)!.data as unknown[])
        : [];

  return list
    .map(normalizeAdminRequest)
    .filter((item): item is AdminRequest => item !== null);
}
