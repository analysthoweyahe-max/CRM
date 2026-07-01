import { useMemo }           from 'react';
import { X }                 from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { Badge }     from '@/shared/components/ui/Badge';
import { DataTable } from '@/shared/components/tables/DataTable';
import { STATUS_MAP, fmtPeriod } from './useSeoLeaveRequestsTable';
import type { SeoLeaveRequestsTableProps } from './SeoLeaveRequestsTable.types';
import type { SeoLeaveRequest }            from '../types/seoLeave.types';

const col = createColumnHelper<SeoLeaveRequest>();

const COL_W = [20, 30, 35, 15];

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
                  <div className="h-4 rounded bg-gray-100 dark:bg-gray-700/60 animate-pulse"
                       style={{ width: `${w + ((c * 11 + r * 7) % 18)}%`, animationDelay: `${r * 50}ms` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SeoLeaveRequestsTable({ requests, isLoading, isAr, onCancel, cancelling }: SeoLeaveRequestsTableProps) {
  // hooks must run before any conditional return
  const columns = useMemo(() => [
    col.accessor('leaveTypeLabel', {
      header: isAr ? 'النوع' : 'Type',
      cell:   info => (
        <span className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
          {info.getValue()}
        </span>
      ),
    }),
    col.display({
      id:     'period',
      header: isAr ? 'الفترة' : 'Period',
      cell:   ({ row }) => (
        <span className="text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
          {fmtPeriod(row.original.startDate, row.original.endDate, row.original.daysCount, isAr)}
        </span>
      ),
    }),
    col.accessor('reason', {
      header: isAr ? 'السبب' : 'Reason',
      cell:   info => (
        <p className="max-w-xs text-gray-700 dark:text-gray-300 truncate">
          {info.getValue() || '–'}
        </p>
      ),
    }),
    col.accessor('status', {
      header: isAr ? 'الحالة' : 'Status',
      cell:   info => {
        const s = STATUS_MAP[info.getValue() as keyof typeof STATUS_MAP] ?? STATUS_MAP.pending;
        return <Badge label={isAr ? s.ar : s.en} variant={s.variant} />;
      },
    }),
    col.display({
      id:   'actions',
      cell: ({ row }) => {
        const req          = row.original;
        const isCancelling = cancelling === req.id;
        if (req.status !== 'pending') return null;
        return (
          <button
            type="button"
            onClick={() => onCancel(req.id)}
            disabled={isCancelling}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium
                       text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700/40
                       hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCancelling ? (
              <span className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            ) : (
              <X size={12} />
            )}
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>
        );
      },
    }),
  ], [isAr, cancelling, onCancel]);

  const table = useReactTable({
    data:                  requests,
    columns,
    getCoreRowModel:       getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState:          { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <TableSkeleton />;

  return (
    <DataTable
      table={table}
      isAr={isAr}
      emptyText={isAr ? 'لا توجد طلبات بعد' : 'No requests yet'}
      withCard={false}
    />
  );
}
