import { Download } from 'lucide-react';
import { Avatar }   from '@/shared/components/ui/Avatar';
import { Button }   from '@/shared/components/ui/Button';
import type { DailyReport } from '../types/teamReport.types';

interface Props {
  report:    DailyReport;
  isAr:      boolean;
  onExport?: () => void;
}

export function DailyReportCard({ report, isAr, onExport }: Props) {
  const { entry } = report;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">

      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
            {isAr ? 'حضور:' : 'In:'} {report.checkIn}
            &nbsp;·&nbsp;
            {isAr ? 'انصراف:' : 'Out:'} {report.checkOut}
          </p>
          {onExport && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              startIcon={<Download size={14} />}
              onClick={onExport}
            >
              Excel
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{report.memberName}</p>
          <Avatar initial={report.memberInitial} color={report.memberColor} size="sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mx-4 mb-3">
        <div className="px-3.5 py-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5 text-right">
            {isAr ? 'المخطط' : 'Planned'}
          </p>
          <ul className="space-y-1 mb-2">
            {entry.tasks.map((task, i) => (
              <li key={i} className="text-xs text-gray-700 dark:text-gray-300 text-right leading-snug flex items-start justify-end gap-1.5">
                <span>{task}</span>
                <span className="mt-1 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
              </li>
            ))}
          </ul>
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 text-left">
            {entry.plannedHours} {isAr ? 'س' : 'h'}
          </p>
        </div>

        <div className="px-3.5 py-3 rounded-xl bg-[#D8EBAE]/50 dark:bg-[#A0CD39]/10">
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mb-1.5 text-right">
            {isAr ? 'الفعلي' : 'Actual'}
          </p>
          <ul className="space-y-1 mb-2">
            {entry.tasks.map((task, i) => (
              <li key={i} className="text-xs text-gray-700 dark:text-gray-300 text-right leading-snug flex items-start justify-end gap-1.5">
                <span>{task}</span>
                <span className="mt-1 w-1 h-1 rounded-full bg-[#A0CD39] shrink-0" />
              </li>
            ))}
          </ul>
          <p className="text-sm font-bold text-[#709028] dark:text-[#A0CD39] text-left">
            {entry.actualHours} {isAr ? 'س' : 'h'}
          </p>
        </div>
      </div>

      {report.notes && (
        <p className="text-xs text-gray-500 dark:text-gray-400 px-4 pb-4 text-right leading-relaxed">
          {isAr ? 'ملاحظات:' : 'Notes:'} {report.notes}
        </p>
      )}
    </div>
  );
}
