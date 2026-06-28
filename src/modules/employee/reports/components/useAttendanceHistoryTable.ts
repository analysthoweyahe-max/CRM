import { formatDateWithWeekday } from '@/shared/utils/date.utils';
import type { DayStatus } from '@/modules/hr/attendance/types/attendance.types';

export const DAY_STATUS_MAP: Record<string, { ar: string; en: string; variant: 'success' | 'warning' | 'error' | 'brand' | 'gray' }> = {
  present: { ar: 'حاضر',  en: 'Present', variant: 'success' },
  late:    { ar: 'متأخر', en: 'Late',    variant: 'warning' },
  absent:  { ar: 'غائب',  en: 'Absent',  variant: 'error'   },
  leave:   { ar: 'إجازة', en: 'Leave',   variant: 'brand'   },
  holiday: { ar: 'عطلة',  en: 'Holiday', variant: 'gray'    },
};

export { formatDateWithWeekday as fmtDate };

export function fmtTime(raw: string | null | undefined) {
  if (!raw) return '—';
  return raw.slice(0, 5);
}

export function fmtHours(h: number | null | undefined, isAr: boolean) {
  if (h == null) return '—';
  return `${h.toFixed(2)} ${isAr ? 'ساعة' : 'hrs'}`;
}

export function getStatusCfg(status: string | DayStatus) {
  return DAY_STATUS_MAP[status] ?? DAY_STATUS_MAP.present;
}
