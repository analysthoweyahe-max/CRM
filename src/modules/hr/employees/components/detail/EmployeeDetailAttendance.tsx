import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/routes';
import { useEmployeeAttendanceRecent } from '@/modules/hr/attendance/hooks/useEmployeeAttendanceRecent';
import type { DayStatus } from '@/modules/hr/attendance/types/attendance.types';

interface Props { employeeId: string; isAr: boolean }

const STATUS_CFG: Record<DayStatus, { bg: string; text: string; dot: string; ar: string; en: string }> = {
  present: { bg: 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10', text: 'text-[#709028] dark:text-[#A0CD39]', dot: 'bg-[#709028]', ar: 'حاضر',   en: 'Present' },
  late:    { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', ar: 'متأخر', en: 'Late'    },
  absent:  { bg: 'bg-red-100 dark:bg-red-900/30',    text: 'text-red-600 dark:text-red-400',    dot: 'bg-red-500',    ar: 'غائب',   en: 'Absent'  },
  leave:   { bg: 'bg-blue-100 dark:bg-blue-900/30',  text: 'text-blue-600 dark:text-blue-400',  dot: 'bg-blue-500',   ar: 'إجازة',  en: 'Leave'   },
};

function AttBadge({ status, isAr }: { status: DayStatus; isAr: boolean }) {
  const cfg = STATUS_CFG[status];
  if (!cfg) return <span className="text-sm text-gray-400">—</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {isAr ? cfg.ar : cfg.en}
    </span>
  );
}

function formatDate(dateStr: string, isAr: boolean) {
  try {
    return new Date(dateStr).toLocaleDateString(isAr ? 'ar-EG' : 'en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function EmployeeDetailAttendance({ employeeId, isAr }: Props) {
  const navigate  = useNavigate();
  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;

  const { data: rows = [], isLoading } = useEmployeeAttendanceRecent(employeeId);

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100
                    dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700
                      flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
          {isAr ? 'أحدث سجلات الحضور' : 'Recent Attendance'}
        </h3>
        <button
          type="button"
          onClick={() => navigate(ROUTES.ATTENDANCE.LOG)}
          className="flex items-center gap-1 text-xs font-medium text-[#709028] dark:text-[#A0CD39]
                     hover:underline transition-colors"
        >
          {isAr ? 'عرض سجل الحضور الكامل' : 'View Full Log'}
          <ArrowIcon size={13} />
        </button>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
            {isAr ? 'جاري التحميل...' : 'Loading...'}
          </div>
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
            {isAr ? 'لا توجد سجلات حضور' : 'No attendance records'}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                {[
                  isAr ? 'التاريخ'      : 'Date',
                  isAr ? 'الدخول'       : 'Check In',
                  isAr ? 'الخروج'       : 'Check Out',
                  isAr ? 'ساعات العمل' : 'Hours',
                  isAr ? 'الحالة'       : 'Status',
                ].map((h, i) => (
                  <th key={i}
                    className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}
                  className="border-b border-gray-50 dark:border-gray-700/50
                             hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-gray-200">
                    {formatDate(row.date, isAr)}
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">{row.check_in ?? '—'}</td>
                  <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">{row.check_out ?? '—'}</td>
                  <td className="px-4 py-3.5 text-[#709028] dark:text-[#A0CD39] font-medium">
                    {row.worked_hours !== null
                      ? isAr ? `س ${row.worked_hours}` : `${row.worked_hours}h`
                      : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <AttBadge status={row.day_status} isAr={isAr} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
