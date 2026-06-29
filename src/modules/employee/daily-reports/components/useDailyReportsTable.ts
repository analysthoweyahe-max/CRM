import { formatDateWithWeekday } from '@/shared/utils/date.utils';
import type { DayReportStatus } from '../types/dailyReport.types';

export const DAY_STATUS_MAP: Record<DayReportStatus, { ar: string; en: string; variant: 'success' | 'warning' }> = {
  completed: { ar: 'مكتمل', en: 'Completed', variant: 'success' },
  pending:   { ar: 'معلق',  en: 'Pending',   variant: 'warning' },
};

export { formatDateWithWeekday as fmtDate };
