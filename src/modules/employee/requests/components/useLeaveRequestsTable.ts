export const STATUS_MAP = {
  approved: { ar: 'موافق عليه',    en: 'Approved', variant: 'success' as const },
  rejected: { ar: 'مرفوض',        en: 'Rejected', variant: 'error'   as const },
  pending:  { ar: 'قيد الانتظار', en: 'Pending',  variant: 'warning' as const },
};

export { formatDateFull as fmtDate } from '@/shared/utils/date.utils';
