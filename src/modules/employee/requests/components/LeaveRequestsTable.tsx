import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { Badge }     from '@/shared/components/ui/Badge';
import { DataTable } from '@/shared/components/tables/DataTable';
import { STATUS_MAP, fmtDate } from './useLeaveRequestsTable';
import type { LeaveRequestsTableProps }     from './LeaveRequestsTable.types';
import type { EmpLeaveRequest }             from '../types/employeeLeave.types';

const col = createColumnHelper<EmpLeaveRequest>();

/* ── 4 cols: النوع / الوصف / التاريخ / الحالة ── */
const COL_W = [25, 45, 20, 20];

function TableSkeleton() {
  return (
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
                    style={{ width: `${w + ((c * 11 + r * 7) % 18)}%`, animationDelay: `${r * 50}ms` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LeaveRequestsTable({ requests, isLoading, isAr }: LeaveRequestsTableProps) {
  if (isLoading) return <TableSkeleton />;
  const columns = useMemo(() => [
    col.accessor('leaveTypeLabel', {
      id:     'type',
      header: isAr ? 'النوع' : 'Type',
      cell:   info => (
        <span className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
          {info.getValue()}
        </span>
      ),
    }),
    col.display({
      id:     'description',
      header: isAr ? 'الوصف' : 'Description',
      cell:   ({ row }) => {
        const notes = row.original.hrNotes;
        return (
          <div className="max-w-xs">
            <p className="text-gray-700 dark:text-gray-300 truncate">
              {row.original.reason ?? '–'}
            </p>
            {notes ? (
              <p className="text-xs text-red-500 dark:text-red-400 truncate mt-0.5">
                {notes}
              </p>
            ) : null}
          </div>
        );
      },
    }),
    col.display({
      id:     'date',
      header: isAr ? 'التاريخ' : 'Date',
      cell:   ({ row }) => (
        <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {fmtDate(row.original.startDate, isAr)} – {fmtDate(row.original.endDate, isAr)}
        </span>
      ),
    }),
    col.accessor('status', {
      header: isAr ? 'الحالة' : 'Status',
      cell:   info => {
        const s = STATUS_MAP[info.getValue()] ?? STATUS_MAP.pending;
        return <Badge label={isAr ? s.ar : s.en} variant={s.variant} />;
      },
    }),
  ], [isAr]);

  const table = useReactTable({
    data:                  requests,
    columns,
    getCoreRowModel:       getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState:          { pagination: { pageSize: 10 } },
  });

  return (
    <DataTable
      table={table}
      isAr={isAr}
      emptyText={isAr ? 'لا توجد طلبات بعد' : 'No requests yet'}
      withCard={false}
    />
  );
}
