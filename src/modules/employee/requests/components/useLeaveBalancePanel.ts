import type { EmpLeaveSummaryItem } from '../types/employeeLeave.types';

const BAR_COLORS = ['bg-blue-500', 'bg-teal-500', 'bg-violet-500', 'bg-rose-500'];

export function useLeaveBalancePanel(summary: EmpLeaveSummaryItem[]) {
  const items = summary.map((item, i) => {
    const total     = item.balance ?? item.total ?? 0;
    const used      = item.used ?? 0;
    const remaining = item.remaining ?? (total - used);
    const pct       = total > 0 ? Math.min((used / total) * 100, 100) : 0;
    const label     = item.label ?? item.typeLabel ?? item.type ?? '–';
    const color     = BAR_COLORS[i % BAR_COLORS.length];
    return { total, used, remaining, pct, label, color };
  });

  return { items };
}
