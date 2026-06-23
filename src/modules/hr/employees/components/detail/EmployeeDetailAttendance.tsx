import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/routes';

interface Props { isAr: boolean }

const ROWS = [
  { date: '2026/06/15', checkIn: 'ص 08:50', checkOut: 'م 05:29', hours: 7.3, status: 'present' },
  { date: '2026/06/14', checkIn: 'ص 08:56', checkOut: 'م 05:42', hours: 7.6, status: 'present' },
  { date: '2026/06/13', checkIn: 'ص 08:57', checkOut: 'م 05:08', hours: 7.7, status: 'present' },
  { date: '2026/06/11', checkIn: 'ص 08:51', checkOut: 'م 05:35', hours: 8.6, status: 'present' },
  { date: '2026/06/10', checkIn: 'ص 08:56', checkOut: 'م 05:32', hours: 8.6, status: 'present' },
  { date: '2026/06/09', checkIn: 'ص 09:42', checkOut: 'م 05:19', hours: 7.7, status: 'late'    },
];

function AttBadge({ status, isAr }: { status: string; isAr: boolean }) {
  const cfg = status === 'present'
    ? { bg: 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10', text: 'text-[#709028] dark:text-[#A0CD39]', dot: 'bg-[#709028]', label: isAr ? 'حاضر' : 'Present' }
    : { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', label: isAr ? 'متأخر' : 'Late' };

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function EmployeeDetailAttendance({ isAr }: Props) {
  const navigate = useNavigate();
  const ArrowIcon = isAr ? ChevronLeft : ChevronRight;

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
            {ROWS.map((row, i) => (
              <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50
                                     hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-gray-200">{row.date}</td>
                <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">{row.checkIn}</td>
                <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">{row.checkOut}</td>
                <td className="px-4 py-3.5 text-[#709028] dark:text-[#A0CD39] font-medium">
                  {isAr ? `س ${row.hours}` : `${row.hours}h`}
                </td>
                <td className="px-4 py-3.5">
                  <AttBadge status={row.status} isAr={isAr} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
