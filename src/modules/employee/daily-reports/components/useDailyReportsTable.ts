import { formatDateWithWeekday } from '@/shared/utils/date.utils';
import type { DailyReportStatus } from '../types/dailyReport.types';

export const REPORT_STATUS_MAP: Record<DailyReportStatus, { ar: string; en: string; variant: 'warning' | 'success' | 'error' }> = {
  submitted: { ar: 'مُقدَّم',  en: 'Submitted', variant: 'warning' },
  approved:  { ar: 'موافق',    en: 'Approved',  variant: 'success' },
  rejected:  { ar: 'مرفوض',   en: 'Rejected',  variant: 'error'   },
};

export { formatDateWithWeekday as fmtDate };
