'use no memo';
import { useMemo } from 'react';
import { useReactTable, getCoreRowModel, getPaginationRowModel, createColumnHelper } from '@tanstack/react-table';
import { CalendarDays } from 'lucide-react';
import { Card }      from '@/shared/components/ui/Card';
import { DataTable } from '@/shared/components/tables/DataTable';
import { DAY_STATUS_MAP, fmtDate } from './useDailyReportsTable';
import type { DailyReportsTableProps } from './DailyReportsTable.types';
import type { DayHistoryItem } from '../types/dailyReport.types';

const col = createColumnHelper<DayHistoryItem>();
const COL_W = [60, 20];

function DailyReportListSkeleton() {
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
                    <div className="h-4 rounded bg-gray-100 dark:bg-gray-700/60 animate-pulse" style={{ width: `${w}%`, animationDelay: `${r * 60}ms` }} />
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

export function DailyReportList({ reports, isLoading, isAr }: DailyReportsTableProps) {
  'use no memo';
  const columns = useMemo(() => [
    col.accessor('date', {
      header: isAr ? 'التاريخ' : 'Date',
      cell: info => (
        <span className="inline-flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
          <CalendarDays size={15} className="text-brand-500" />
          {fmtDate(info.getValue(), isAr)}
        </span>
      ),
    }),
    col.accessor('status', {
      header: isAr ? 'الحالة' : 'Status',
      cell: info => {
        const cfg = DAY_STATUS_MAP[info.getValue()];
        return <span className="text-sm font-semibold text-brand-500">{isAr ? cfg.ar : cfg.en}</span>;
      },
    }),
  ], [isAr]);

  const table = useReactTable({
    data: reports, columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  if (isLoading) return <DailyReportListSkeleton />;

  return (
    <DataTable table={table} isAr={isAr}
      emptyText={isAr ? 'لا توجد تقارير' : 'No reports found'} />
  );
}
