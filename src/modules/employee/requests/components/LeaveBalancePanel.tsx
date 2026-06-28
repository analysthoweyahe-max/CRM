import { useLeaveBalancePanel } from './useLeaveBalancePanel';
import type { LeaveBalancePanelProps } from './LeaveBalancePanel.types';

export function LeaveBalancePanel({ summary, isLoading, isAr }: LeaveBalancePanelProps) {
  const { items } = useLeaveBalancePanel(summary);

  return (
    <div className="rounded-xl border border-gray-100 dark:border-gray-700/60 overflow-hidden">

      {/* Header */}
      <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-700/20">
        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 text-end">
          {isAr ? 'رصيد إجازاتي' : 'My Leave Balance'}
        </h3>
      </div>

      {/* Progress bars */}
      <div className="p-5 space-y-5">
        {isLoading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 rounded bg-gray-200 dark:bg-gray-700 w-20" />
                <div className="h-4 rounded bg-gray-200 dark:bg-gray-700 w-28" />
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-700" />
            </div>
          ))
        ) : items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            {isAr ? 'لا توجد بيانات' : 'No data available'}
          </p>
        ) : (
          items.map((item, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {item.used} / {item.total} {isAr ? 'يوم' : 'days'}
                </span>
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {item.label}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary footer */}
      {!isLoading && items.length > 0 && (
        <div className="px-5 py-3 bg-[#D8EBAE]/50 dark:bg-[#A0CD39]/10 border-t border-[#A0CD39]/20 text-sm text-end">
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {isAr ? 'الأيام المتبقية: ' : 'Remaining: '}
          </span>
          {items.map((item, i) => (
            <span key={i} className="text-gray-600 dark:text-gray-400">
              {i > 0 && ' | '}{item.remaining} {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
