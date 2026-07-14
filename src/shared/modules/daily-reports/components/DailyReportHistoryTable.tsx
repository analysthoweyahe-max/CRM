'use no memo';
import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { CalendarDays, Clock, Download, FileSpreadsheet } from 'lucide-react';
import { Card }      from '@/shared/components/ui/Card';
import { Button }    from '@/shared/components/ui/Button';
import { DataTable } from '@/shared/components/tables/DataTable';
import { formatDateWithWeekday } from '@/shared/utils/date.utils';
import type { DailyReportHistoryItem } from '../types/dailyReport.types';
import { exportHistoryReport, exportHistoryTable } from '../utils/exportDailyReports';

const col = createColumnHelper<DailyReportHistoryItem>();
const COL_W = [18, 10, 10, 28, 10, 10, 14];

interface Props {
  reports:   DailyReportHistoryItem[];
  isLoading: boolean;
  isAr:      boolean;
}

function HistorySkeleton() {
  return (
    <Card overflow>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-700/40 border-b border-gray-100 dark:border-gray-700">
            <tr>
              {COL_W.map((w, i) => (
                <th key={i} className="px-5 py-3">
                  <div className="h-3 rounded bg-gray-200 dark:bg-gray-600 animate-pulse" style={{ width: `${w}%` }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
            {Array.from({ length: 5 }).map((_, r) => (
              <tr key={r}>
                {COL_W.map((w, c) => (
                  <td key={c} className="px-5 py-4">
                    <div
                      className="h-4 rounded bg-gray-100 dark:bg-gray-700/60 animate-pulse"
                      style={{ width: `${w}%`, animationDelay: `${r * 60}ms` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function DailyReportHistoryTable({ reports, isLoading, isAr }: Props) {
  'use no memo';

  const columns = useMemo(() => [
    col.accessor('reportDate', {
      header: isAr ? 'التاريخ' : 'Date',
      cell: info => (
        <span className="inline-flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          <CalendarDays size={15} className="text-brand-500 shrink-0" />
          {formatDateWithWeekday(info.getValue(), isAr)}
        </span>
      ),
    }),
    col.accessor('checkInAt', {
      header: isAr ? 'حضور' : 'In',
      cell: info => (
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300 tabular-nums">
          <Clock size={13} className="text-gray-400" />
          {info.getValue() || '—'}
        </span>
      ),
    }),
    col.accessor('checkOutAt', {
      header: isAr ? 'انصراف' : 'Out',
      cell: info => (
        <span className="text-sm text-gray-600 dark:text-gray-300 tabular-nums">
          {info.getValue() || '—'}
        </span>
      ),
    }),
    col.accessor('tasks', {
      header: isAr ? 'المهام' : 'Tasks',
      cell: info => {
        const tasks = info.getValue();
        if (!tasks.length) {
          return <span className="text-sm text-gray-400">—</span>;
        }
        return (
          <ul className="space-y-1 text-start max-w-xs">
            {tasks.map((t, i) => (
              <li key={`${t.taskTitle}-${i}`} className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                <span className="font-medium">{t.taskTitle}</span>
                <span className="text-xs text-gray-400 ms-1.5">
                  {t.plannedHours}/{t.actualHours}{isAr ? 'س' : 'h'}
                </span>
              </li>
            ))}
          </ul>
        );
      },
    }),
    col.display({
      id: 'planned',
      header: isAr ? 'مخطط' : 'Planned',
      cell: ({ row }) => {
        const sum = row.original.tasks.reduce((s, t) => s + t.plannedHours, 0);
        return <span className="text-sm font-semibold tabular-nums text-gray-700 dark:text-gray-200">{sum}</span>;
      },
    }),
    col.display({
      id: 'actual',
      header: isAr ? 'فعلي' : 'Actual',
      cell: ({ row }) => {
        const sum = row.original.tasks.reduce((s, t) => s + t.actualHours, 0);
        return <span className="text-sm font-semibold tabular-nums text-brand-600 dark:text-brand-400">{sum}</span>;
      },
    }),
    col.accessor('summaryNote', {
      header: isAr ? 'الملخص' : 'Summary',
      cell: info => (
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 max-w-[14rem] text-start">
          {info.getValue() || '—'}
        </p>
      ),
    }),
    col.display({
      id: 'actions',
      header: isAr ? 'تصدير' : 'Export',
      cell: ({ row }) => (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          startIcon={<Download size={14} />}
          onClick={() => exportHistoryReport(row.original, isAr)}
        >
          {isAr ? 'Excel' : 'Excel'}
        </Button>
      ),
    }),
  ], [isAr]);

  const table = useReactTable({
    data: reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  if (isLoading) return <HistorySkeleton />;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          startIcon={<FileSpreadsheet size={15} />}
          disabled={!reports.length}
          onClick={() => exportHistoryTable(reports, isAr)}
        >
          {isAr ? 'تصدير الكل' : 'Export all'}
        </Button>
      </div>

      <DataTable
        table={table}
        isAr={isAr}
        emptyText={isAr ? 'لا توجد تقارير' : 'No reports found'}
      />
    </div>
  );
}
