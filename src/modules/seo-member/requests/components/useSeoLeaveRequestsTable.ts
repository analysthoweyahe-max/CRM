import { STATUS_MAP } from '@/modules/employee/requests/components/useLeaveRequestsTable';
import { formatDateFull } from '@/shared/utils/date.utils';

export { STATUS_MAP };
export { formatDateFull as fmtDate };

export function fmtPeriod(startDate: string, endDate: string, daysCount: number, isAr: boolean): string {
  const start = formatDateFull(startDate, isAr);
  const end   = formatDateFull(endDate, isAr);
  if (startDate === endDate) return `${start} (${daysCount} ${isAr ? 'يوم' : 'day'})`;
  return `${start} — ${end} (${daysCount} ${isAr ? 'أيام' : 'days'})`;
}
