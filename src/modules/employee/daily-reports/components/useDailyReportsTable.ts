import type { DailyReportStatus } from '../types/dailyReport.types';

export const REPORT_STATUS_MAP: Record<DailyReportStatus, { ar: string; en: string; variant: 'warning' | 'success' | 'error' }> = {
  submitted: { ar: 'مُقدَّم',  en: 'Submitted', variant: 'warning' },
  approved:  { ar: 'موافق',    en: 'Approved',  variant: 'success' },
  rejected:  { ar: 'مرفوض',   en: 'Rejected',  variant: 'error'   },
};

export function fmtDate(raw: string, isAr: boolean) {
  if (!raw) return '—';
  return new Date(raw).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
    weekday: 'short', day: 'numeric', month: 'short',
  });
}
