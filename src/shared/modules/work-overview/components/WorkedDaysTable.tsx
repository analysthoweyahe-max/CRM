import { EmptyState } from '@/shared/components/feedback/EmptyState';
import type { WorkedDay } from '../types/workOverview.types';
import {
  dayStatusBadgeClass,
  formatTimeHHmm,
  formatWorkHours,
} from '../utils/workOverview.utils';

interface WorkedDaysTableProps {
  days: WorkedDay[];
  isAr: boolean;
  isLoading?: boolean;
}

export function WorkedDaysTable({ days, isAr, isLoading }: WorkedDaysTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  if (days.length === 0) {
    return (
      <EmptyState
        title={isAr ? 'لا توجد أيام حضور لهذا الشهر' : 'No attendance days for this month'}
        description={isAr ? 'سيظهر سجل أيام العمل هنا عند توفره' : 'Worked days will appear here when available'}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400">
            <th className="px-4 py-2.5 text-start font-medium">{isAr ? 'التاريخ' : 'Date'}</th>
            <th className="px-4 py-2.5 text-start font-medium">{isAr ? 'حضور' : 'Check-in'}</th>
            <th className="px-4 py-2.5 text-start font-medium">{isAr ? 'انصراف' : 'Check-out'}</th>
            <th className="px-4 py-2.5 text-start font-medium">{isAr ? 'الساعات' : 'Hours'}</th>
            <th className="px-4 py-2.5 text-start font-medium">{isAr ? 'الحالة' : 'Status'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {days.map((d) => (
            <tr key={d.date} className="bg-white dark:bg-gray-900">
              <td className="px-4 py-2.5 font-mono text-gray-700 dark:text-gray-300">{d.date}</td>
              <td className="px-4 py-2.5 font-mono text-gray-700 dark:text-gray-300">{formatTimeHHmm(d.checkInTime)}</td>
              <td className="px-4 py-2.5 font-mono text-gray-700 dark:text-gray-300">{formatTimeHHmm(d.checkOutTime)}</td>
              <td className="px-4 py-2.5 font-mono font-semibold text-gray-900 dark:text-gray-100">{formatWorkHours(d.workingHours)}</td>
              <td className="px-4 py-2.5">
                <span className={`inline-flex text-[11px] px-2 py-0.5 rounded-full font-medium ${dayStatusBadgeClass(d.dayStatus)}`}>
                  {d.dayStatusLabel || d.dayStatus || '—'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
