import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/app/router/routes';
import { useEmployeeLeaveSummary, useEmployeeLeaveHistory } from '@/modules/hr/leaves/hooks/useLeaves';
import { formatDateShort } from '@/shared/utils/date.utils';
import { formatLeaveDuration } from '@/modules/hr/leaves/utils/leave.utils';
import type { LeaveStatus, ApiLeaveRequest } from '@/modules/hr/leaves/types/leaves.types';

interface Props { employeeId: string; isAr: boolean }

const STATUS_CFG: Record<LeaveStatus, { bg: string; text: string; dot: string; label: (isAr: boolean) => string }> = {
  approved: { bg: 'bg-[#D8EBAE] dark:bg-[#D8EBAE]/10', text: 'text-[#709028] dark:text-[#A0CD39]', dot: 'bg-[#709028]', label: (a) => a ? 'موافق' : 'Approved' },
  pending:  { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500', label: (a) => a ? 'معلقة' : 'Pending' },
  rejected: { bg: 'bg-red-100 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500', label: (a) => a ? 'مرفوضة' : 'Rejected' },
};

function LeaveBadge({ status, isAr }: { status: LeaveStatus; isAr: boolean }) {
  const cfg = STATUS_CFG[status];
  if (!cfg) return <span className="text-sm text-gray-400">—</span>;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label(isAr)}
    </span>
  );
}

export function EmployeeDetailLeaves({ employeeId, isAr }: Props) {
  const navigate = useNavigate();

  const { data: summary, isLoading: summaryLoading } = useEmployeeLeaveSummary(employeeId);
  const { data: historyPage, isLoading: historyLoading } = useEmployeeLeaveHistory(employeeId, { per_page: 10 });

  const annual    = summary?.annual_balance ?? 0;
  const used      = summary?.used           ?? 0;
  const remaining = summary?.remaining      ?? 0;
  const rows      = historyPage?.data       ?? [];

  return (
    <div className="space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100
                        dark:border-gray-700 shadow-sm p-5 text-center">
          {summaryLoading
            ? <div className="h-9 w-12 mx-auto rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
            : <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{annual}</p>}
          <p className="text-xs mt-1 text-gray-400 dark:text-gray-500">
            {isAr ? 'إجمالي الرصيد السنوي' : 'Total Annual Balance'}
          </p>
        </div>

        <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100
                        dark:border-red-900/30 shadow-sm p-5 text-center">
          {summaryLoading
            ? <div className="h-9 w-8 mx-auto rounded bg-red-200 dark:bg-red-800 animate-pulse" />
            : <p className="text-3xl font-bold text-red-600 dark:text-red-400">{used}</p>}
          <p className="text-xs mt-1 text-red-400 dark:text-red-500">
            {isAr ? 'المستخدم' : 'Used'}
          </p>
        </div>

        <div className="rounded-2xl bg-[#D8EBAE] dark:bg-[#D8EBAE]/10 border border-[#A0CD39]/30
                        shadow-sm p-5 text-center">
          {summaryLoading
            ? <div className="h-9 w-8 mx-auto rounded bg-[#A0CD39]/40 animate-pulse" />
            : <p className="text-3xl font-bold text-[#709028] dark:text-[#A0CD39]">{remaining}</p>}
          <p className="text-xs mt-1 text-[#709028]/70 dark:text-[#A0CD39]/70">
            {isAr ? 'المتبقي' : 'Remaining'}
          </p>
        </div>
      </div>

      {/* History table */}
      <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100
                      dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {historyLoading ? (
            <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              {isAr ? 'جاري التحميل...' : 'Loading...'}
            </div>
          ) : rows.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              {isAr ? 'لا توجد سجلات إجازات' : 'No leave records'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30">
                  {[
                    isAr ? 'نوع الإجازة' : 'Type',
                    isAr ? 'من'          : 'From',
                    isAr ? 'إلى'         : 'To',
                    isAr ? 'المدة'       : 'Duration',
                    isAr ? 'الحالة'      : 'Status',
                    isAr ? 'التفاصيل'   : 'Details',
                  ].map((h, i) => (
                    <th key={i}
                      className="px-4 py-3 text-start text-xs font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row: ApiLeaveRequest) => (
                  <tr key={row.id} className="border-b border-gray-50 dark:border-gray-700/50
                                              hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-gray-200">
                      {row.leave_type_label ?? row.leave_type}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                      {formatDateShort(row.start_date, isAr)}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                      {formatDateShort(row.end_date, isAr)}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">
                      {formatLeaveDuration(row.days_count, isAr)}
                    </td>
                    <td className="px-4 py-3.5">
                      <LeaveBadge status={row.status} isAr={isAr} />
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => navigate(ROUTES.LEAVES.DETAIL(row.id))}
                        className="text-xs text-[#709028] dark:text-[#A0CD39] hover:underline font-medium"
                      >
                        {isAr ? 'التفاصيل' : 'Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
