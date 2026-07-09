import type { DayStatus } from '../types/attendance.types';

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; ar: string; en: string }> = {
  present:           { bg: 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10', text: 'text-[#709028] dark:text-[#A0CD39]', dot: 'bg-[#709028]', ar: 'حاضر',           en: 'Present'           },
  normal_day:        { bg: 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10', text: 'text-[#709028] dark:text-[#A0CD39]', dot: 'bg-[#709028]', ar: 'يوم عادي',       en: 'Normal Day'        },
  late:              { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', ar: 'متأخر',         en: 'Late'              },
  late_arrival:      { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', ar: 'تأخر',          en: 'Late Arrival'      },
  absent:            { bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-600 dark:text-red-400',       dot: 'bg-red-500',    ar: 'غائب',          en: 'Absent'            },
  leave:             { bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-600 dark:text-blue-400',     dot: 'bg-blue-500',   ar: 'إجازة',         en: 'Leave'             },
  early_leave:       { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500', ar: 'انصراف مبكر', en: 'Early Leave'       },
  overtime:          { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500', ar: 'ساعات إضافية',  en: 'Overtime'          },
  awaiting_check_in: { bg: 'bg-gray-100 dark:bg-gray-800',       text: 'text-gray-600 dark:text-gray-400',       dot: 'bg-gray-400',   ar: 'بانتظار الحضور', en: 'Awaiting Check-in' },
};

export function DayBadge({ status, isAr, label }: { status: DayStatus | string; isAr: boolean; label?: string }) {
  const cfg = STATUS_CFG[status];
  if (!cfg && !label) return <span className="text-sm text-gray-400">—</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg?.bg ?? 'bg-gray-100 dark:bg-gray-800'} ${cfg?.text ?? 'text-gray-600 dark:text-gray-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg?.dot ?? 'bg-gray-400'}`} />
      {label ?? (isAr ? cfg?.ar : cfg?.en) ?? status}
    </span>
  );
}
