import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { ROUTES }           from '@/app/router/routes';
import { LeaveStatusBadge } from './LeaveStatusBadge';
import { getInitial, getAvatarColor } from '@/modules/hr/employees/types/employee.types';
import type { ApiLeaveRequest } from '../types/leaves.types';

interface Props {
  row:  ApiLeaveRequest;
  isAr: boolean;
}

export function LeaveTableRow({ row, isAr }: Props) {
  const navigate = useNavigate();
  const name    = row.employee?.name ?? row.employee_name ?? '';
  const dept    = row.employee?.department ?? row.employee_department ?? '';
  const initial = name ? getInitial(name) : '?';
  const color   = name ? getAvatarColor(name) : 'bg-gray-400';

  return (
    <tr className="border-b border-gray-50 dark:border-gray-700/50
                   hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${color} flex items-center justify-center shrink-0`}>
            <span className="text-xs font-bold text-white">{initial}</span>
          </div>
          <div className="min-w-0">
            <p className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">{name || '–'}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{dept || '–'}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {row.leave_type_label ?? row.leave_type}
      </td>
      <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{row.start_date}</td>
      <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{row.end_date}</td>
      <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">
        {row.days_count} {isAr
          ? (row.days_count === 1 ? 'يوم' : 'أيام')
          : (row.days_count === 1 ? 'day' : 'days')}
      </td>
      <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">{row.request_date}</td>
      <td className="px-4 py-3.5"><LeaveStatusBadge status={row.status} isAr={isAr} /></td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => navigate(ROUTES.LEAVES.DETAIL(row.id))}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400
                       hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isAr ? 'عرض' : 'View'}>
            <Eye size={14} />
          </button>
          {row.status === 'pending' && (
            <>
              <button type="button" onClick={() => navigate(ROUTES.LEAVES.DETAIL(row.id))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#709028]
                           hover:bg-[#D8EBAE] dark:hover:bg-[#D8EBAE]/10 transition-colors"
                title={isAr ? 'موافقة' : 'Approve'}>
                <CheckCircle size={14} />
              </button>
              <button type="button" onClick={() => navigate(ROUTES.LEAVES.DETAIL(row.id))}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500
                           hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                title={isAr ? 'رفض' : 'Reject'}>
                <XCircle size={14} />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
