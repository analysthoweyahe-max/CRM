import type { DayStatus } from '../types/attendance.types';

const STATUS_CFG: Record<DayStatus, { bg: string; text: string; dot: string; ar: string; en: string }> = {
  present: { bg: 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10', text: 'text-[#709028] dark:text-[#A0CD39]', dot: 'bg-[#709028]', ar: 'حاضر',  en: 'Present' },
  late:    { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', ar: 'متأخر', en: 'Late'    },
  absent:  { bg: 'bg-red-100 dark:bg-red-900/30',      text: 'text-red-600 dark:text-red-400',       dot: 'bg-red-500',    ar: 'غائب',  en: 'Absent'  },
  leave:   { bg: 'bg-blue-100 dark:bg-blue-900/30',    text: 'text-blue-600 dark:text-blue-400',     dot: 'bg-blue-500',   ar: 'إجازة', en: 'Leave'   },
};

export function DayBadge({ status, isAr }: { status: DayStatus; isAr: boolean }) {
  const cfg = STATUS_CFG[status];
  if (!cfg) return <span className="text-sm text-gray-400">—</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {isAr ? cfg.ar : cfg.en}
    </span>
  );
}
