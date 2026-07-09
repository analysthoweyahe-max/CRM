import { useQuery } from '@tanstack/react-query';
import { useLang } from '@/app/providers/LanguageProvider';
import { attendanceTimerApi } from '../api/attendanceTimer.api';
import type { AttendanceScope, AttendanceHistoryRecord } from '../types/attendanceTimer.types';
import { formatClockTime, formatWorkingHours } from '../utils/attendanceTimer.utils';

interface AttendanceHistorySectionProps {
  scope:  AttendanceScope;
  month:  string;
}

function recordCheckIn(r: AttendanceHistoryRecord): string | null {
  return r.checkInTime ?? r.check_in ?? null;
}

function recordCheckOut(r: AttendanceHistoryRecord): string | null {
  return r.checkOutTime ?? r.check_out ?? null;
}

function recordHours(r: AttendanceHistoryRecord): number | null {
  return r.workingHours ?? r.worked_hours ?? null;
}

export function AttendanceHistorySection({ scope, month }: AttendanceHistorySectionProps) {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const { data, isLoading } = useQuery({
    queryKey: ['attendance', 'history', scope, month],
    queryFn:  () => attendanceTimerApi.history(scope, { month, per_page: 31 }).then(r => r.data.data?.data ?? []),
    staleTime: 60_000,
  });

  const records = data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
        {isAr ? 'لا توجد سجلات لهذا الشهر' : 'No records for this month'}
      </p>
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
            <th className="px-4 py-2.5 text-start font-medium">{isAr ? 'ساعات العمل' : 'Hours'}</th>
            <th className="px-4 py-2.5 text-start font-medium">{isAr ? 'استراحة' : 'Break'}</th>
            <th className="px-4 py-2.5 text-start font-medium">{isAr ? 'الحالة' : 'Status'}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {records.map(r => (
            <tr key={String(r.id ?? r.date)} className="bg-white dark:bg-gray-900">
              <td className="px-4 py-2.5 font-mono text-gray-700 dark:text-gray-300">{r.date}</td>
              <td className="px-4 py-2.5 font-mono">{formatClockTime(recordCheckIn(r), isAr)}</td>
              <td className="px-4 py-2.5 font-mono">{formatClockTime(recordCheckOut(r), isAr)}</td>
              <td className="px-4 py-2.5 font-mono font-semibold">{formatWorkingHours(recordHours(r))}</td>
              <td className="px-4 py-2.5">{r.breakMinutes != null ? `${r.breakMinutes}${isAr ? ' د' : 'm'}` : '—'}</td>
              <td className="px-4 py-2.5">
                <div className="flex flex-wrap gap-1">
                  {(r.statusFlags ?? []).map(f => (
                    <span key={f.value} className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {f.label}
                    </span>
                  ))}
                  {!r.statusFlags?.length && (r.dayStatusLabel ?? r.day_status ?? '—')}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
