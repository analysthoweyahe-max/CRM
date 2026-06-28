import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { Badge }     from '@/shared/components/ui/Badge';
import { Card }      from '@/shared/components/ui/Card';
import { DataTable } from '@/shared/components/tables/DataTable';
import { fmtDate, fmtTime, fmtHours, getStatusCfg } from './useAttendanceHistoryTable';
import type { AttendanceHistoryTableProps } from './AttendanceHistoryTable.types';
import type { ApiEmployeeAttendanceRecord } from '@/modules/hr/attendance/types/attendance.types';

const col = createColumnHelper<ApiEmployeeAttendanceRecord>();

/* ── skeleton ── */
const COL_W = [40, 25, 25, 20, 25];

function TableSkeleton() {
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
            {Array.from({ length: 8 }).map((_, r) => (
              <tr key={r}>
                {COL_W.map((w, c) => (
                  <td key={c} className="px-5 py-4">
                    <div
                      className="h-4 rounded bg-gray-100 dark:bg-gray-700/60 animate-pulse"
                      style={{ width: `${w + ((c * 13 + r * 9) % 20)}%`, animationDelay: `${r * 50}ms` }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100 dark:border-gray-700">
        <div className="flex gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
        <div className="h-3 w-32 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
      </div>
    </Card>
  );
}

/* ── table ── */
export function AttendanceHistoryTable({ records, isLoading, isAr }: AttendanceHistoryTableProps) {
  const columns = useMemo(() => [
    col.accessor('date', {
      header: isAr ? 'التاريخ' : 'Date',
      cell:   info => (
        <span className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
          {fmtDate(info.getValue(), isAr)}
        </span>
      ),
    }),
    col.accessor('check_in', {
      header: isAr ? 'الحضور' : 'Check-in',
      cell:   info => (
        <span className="tabular-nums text-gray-700 dark:text-gray-300">
          {fmtTime(info.getValue())}
        </span>
      ),
    }),
    col.accessor('check_out', {
      header: isAr ? 'الانصراف' : 'Check-out',
      cell:   info => (
        <span className="tabular-nums text-gray-700 dark:text-gray-300">
          {fmtTime(info.getValue())}
        </span>
      ),
    }),
    col.accessor('worked_hours', {
      header: isAr ? 'الساعات' : 'Hours',
      cell:   info => (
        <span className="tabular-nums text-gray-600 dark:text-gray-400">
          {fmtHours(info.getValue(), isAr)}
        </span>
      ),
    }),
    col.accessor('day_status', {
      header: isAr ? 'الحالة' : 'Status',
      cell:   info => {
        const cfg = getStatusCfg(info.getValue());
        return <Badge label={isAr ? cfg.ar : cfg.en} variant={cfg.variant} />;
      },
    }),
  ], [isAr]);

  const table = useReactTable({
    data:                  records,
    columns,
    getCoreRowModel:       getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState:          { pagination: { pageSize: 15 } },
  });

  if (isLoading) return <TableSkeleton />;

  return (
    <DataTable
      table={table}
      isAr={isAr}
      isLoading={false}
      emptyText={isAr ? 'لا توجد سجلات' : 'No records found'}
    />
  );
}
