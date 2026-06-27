import { Avatar } from '@/shared/components/ui/Avatar';
import type { DailyReport } from '../types/report.types';

interface Props {
  report: DailyReport;
  isAr:   boolean;
}

export function DailyReportCard({ report, isAr }: Props) {
  const { entry } = report;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {isAr ? 'حضور:' : 'In:'} {report.checkIn}
          &nbsp;·&nbsp;
          {isAr ? 'انصراف:' : 'Out:'} {report.checkOut}
        </p>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{report.memberName}</p>
          <Avatar initial={report.memberInitial} color={report.memberColor} size="sm" />
        </div>
      </div>

      {/* Work entry — two columns with gap */}
      <div className="grid grid-cols-2 gap-3 mx-4 mb-3">

        {/* Planned — right column in RTL */}
        <div className="px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5 text-right">
            {isAr ? 'المخطط' : 'Planned'}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 text-right leading-snug mb-2">
            {entry.taskTitle}
          </p>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 text-left">
            {entry.plannedHours} {isAr ? 'س' : 'h'}
          </p>
        </div>

        {/* Actual — left column in RTL */}
        <div className="px-3.5 py-3 rounded-xl bg-[#D8EBAE]/50 dark:bg-[#A0CD39]/10">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5 text-right">
            {isAr ? 'الفعلي' : 'Actual'}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 text-right leading-snug mb-2">
            {entry.taskTitle}
          </p>
          <p className="text-sm font-bold text-[#709028] dark:text-[#A0CD39] text-left">
            {entry.actualHours} {isAr ? 'س' : 'h'}
          </p>
        </div>
      </div>

      {/* Notes */}
      {report.notes && (
        <p className="text-xs text-gray-500 dark:text-gray-400 px-4 pb-4 text-right leading-relaxed">
          {report.notes}
        </p>
      )}
    </div>
  );
}
