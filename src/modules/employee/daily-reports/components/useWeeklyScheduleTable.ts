import type { WeeklyRow } from '../types/dailyReport.types';

export const DAYS = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'] as const;
export type DayKey = typeof DAYS[number];

export const DAY_LABELS_AR: Record<DayKey, string> = {
  sat: 'السبت', sun: 'الأحد', mon: 'الإثنين',
  tue: 'الثلاثاء', wed: 'الأربعاء', thu: 'الخميس', fri: 'الجمعة',
};

export const DAY_LABELS_EN: Record<DayKey, string> = {
  sat: 'Sat', sun: 'Sun', mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri',
};

export function fmtHour(val: number | null) {
  return val === null ? '—' : String(val);
}

export function computeTotalsRow(rows: WeeklyRow[], label: string): WeeklyRow {
  const dayTotals = DAYS.reduce((acc, d) => {
    const sum = rows.reduce((s, r) => s + (r[d] ?? 0), 0);
    return { ...acc, [d]: sum || null };
  }, {} as Record<DayKey, number | null>);
  return { taskId: '__total', taskName: label, ...dayTotals, total: rows.reduce((s, r) => s + r.total, 0) };
}

export function exportToCSV(rows: WeeklyRow[], isAr: boolean) {
  const labels  = isAr ? DAY_LABELS_AR : DAY_LABELS_EN;
  const headers = [isAr ? 'المهمة' : 'Task', ...DAYS.map(d => labels[d]), isAr ? 'الإجمالي' : 'Total'];
  const body    = rows.map(r => [r.taskName, ...DAYS.map(d => r[d] ?? ''), r.total].join(','));
  const csv     = [headers.join(','), ...body].join('\n');
  const url     = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a       = Object.assign(document.createElement('a'), { href: url, download: 'weekly-report.csv' });
  a.click();
  URL.revokeObjectURL(url);
}
