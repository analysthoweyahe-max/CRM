import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/routes';
import { useEmployeeAttendanceRecent } from '@/modules/hr/attendance/hooks/useEmployeeAttendanceRecent';
import { DayBadge } from '@/modules/hr/attendance/components/DayBadge';

interface Props { employeeId: string; isAr: boolean }

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

  const { data: rawRows, isLoading } = useEmployeeAttendanceRecent(employeeId);
  const rows = Array.isArray(rawRows) ? rawRows : [];

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
                    <DayBadge status={row.day_status} isAr={isAr} />
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
