import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';
import { Download, Send } from 'lucide-react';
import { Card }      from '@/shared/components/ui/Card';
import { Button }    from '@/shared/components/ui/Button';
import { DataTable } from '@/shared/components/tables/DataTable';
import { DAYS, DAY_LABELS_AR, DAY_LABELS_EN, fmtHour, computeTotalsRow, exportToCSV } from './useWeeklyScheduleTable';
import type { WeeklyScheduleTableProps } from './WeeklyScheduleTable.types';
import type { WeeklyRow } from '../types/dailyReport.types';

const col = createColumnHelper<WeeklyRow>();
const COL_W = [30, 8, 8, 8, 8, 8, 8, 8, 10];

function WeeklyScheduleTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-32 rounded-lg bg-brand-100 dark:bg-brand-900/30 animate-pulse" />
        <div className="h-8 w-28 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
      </div>
      <Card overflow>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/40 border-b border-gray-100 dark:border-gray-700">
              <tr>
                {COL_W.map((w, i) => (
                  <th key={i} className="px-5 py-3">
                    <div className="h-3 rounded bg-gray-200 dark:bg-gray-600 animate-pulse" style={{ width: `${w * 2}px` }} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {Array.from({ length: 3 }).map((_, r) => (
                <tr key={r}>
                  {COL_W.map((w, c) => (
                    <td key={c} className="px-5 py-4">
                      <div className="h-4 rounded bg-gray-100 dark:bg-gray-700/60 animate-pulse" style={{ width: `${w * 2}px`, animationDelay: `${r * 60}ms` }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export function WeeklyScheduleTable({ rows, isLoading, isAr }: WeeklyScheduleTableProps) {
  const labels    = isAr ? DAY_LABELS_AR : DAY_LABELS_EN;
  const totalsRow = useMemo(() => computeTotalsRow(rows, isAr ? 'إجمالي اليوم' : 'Daily Total'), [rows, isAr]);
  const tableData = useMemo(() => [...rows, totalsRow], [rows, totalsRow]);

  const columns = useMemo(() => [
    col.accessor('taskName', {
      header: isAr ? 'المهمة' : 'Task',
      cell: info => {
        const isTotal = info.row.original.taskId === '__total';
        return <span className={`text-sm ${isTotal ? 'font-bold text-gray-900 dark:text-gray-100' : 'font-medium text-gray-700 dark:text-gray-300'}`}>{info.getValue()}</span>;
      },
    }),
    ...DAYS.map(day => col.accessor(day, {
      id: day, header: labels[day],
      cell: info => {
        const isTotal = info.row.original.taskId === '__total';
        return <span className={`tabular-nums text-sm ${isTotal ? 'font-semibold text-gray-800 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>{fmtHour(info.getValue())}</span>;
      },
    })),
    col.accessor('total', {
      header: isAr ? 'الإجمالي' : 'Total',
      cell: info => {
        const isTotal = info.row.original.taskId === '__total';
        return <span className={`tabular-nums font-bold text-sm ${isTotal ? 'bg-brand-500 text-white px-3 py-1 rounded-lg' : 'text-brand-600'}`}>{fmtHour(info.getValue())}</span>;
      },
    }),
  ], [isAr, labels]);

  const table = useReactTable({ data: tableData, columns, getCoreRowModel: getCoreRowModel() });

  if (isLoading) return <WeeklyScheduleTableSkeleton />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="primary" size="sm" startIcon={<Send size={15} />}>
          {isAr ? 'إرسال للمراجعة' : 'Submit for Review'}
        </Button>
        <Button variant="secondary" size="sm" startIcon={<Download size={15} />} onClick={() => exportToCSV(rows, isAr)}>
          {isAr ? 'تصدير CSV' : 'Export CSV'}
        </Button>
      </div>
      <DataTable table={table} isAr={isAr} emptyText={isAr ? 'لا توجد بيانات' : 'No data'} />
    </div>
  );
}
