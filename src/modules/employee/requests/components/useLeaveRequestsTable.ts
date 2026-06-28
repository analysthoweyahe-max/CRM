import type { EmpLeaveType } from '../types/employeeLeave.types';

export const STATUS_MAP = {
  approved: { ar: 'موافق عليه',    en: 'Approved', variant: 'success' as const },
  rejected: { ar: 'مرفوض',        en: 'Rejected', variant: 'error'   as const },
  pending:  { ar: 'قيد الانتظار', en: 'Pending',  variant: 'warning' as const },
};

export { formatDateFull as fmtDate } from '@/shared/utils/date.utils';

export function getTypeName(t: EmpLeaveType | string | undefined, isAr: boolean): string {
  if (!t) return '–';
  if (typeof t === 'string') return t;
  return (isAr ? (t.name ?? t.nameAr) : t.nameEn) ?? t.name ?? t.label ?? '–';
}
