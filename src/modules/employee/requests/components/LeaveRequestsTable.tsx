import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
} from '@tanstack/react-table';
import { Badge }     from '@/shared/components/ui/Badge';
import { DataTable } from '@/shared/components/tables/DataTable';
import { STATUS_MAP, fmtDate, getTypeName } from './useLeaveRequestsTable';
import type { LeaveRequestsTableProps }     from './LeaveRequestsTable.types';
import type { EmpLeaveRequest }             from '../types/employeeLeave.types';

const col = createColumnHelper<EmpLeaveRequest>();

export function LeaveRequestsTable({ requests, isLoading, isAr }: LeaveRequestsTableProps) {
  const columns = useMemo(() => [
    col.accessor(row => getTypeName(row.type, isAr), {
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
      cell:   ({ row }) => (
        <div className="max-w-xs">
          <p className="text-gray-700 dark:text-gray-300 truncate">
            {row.original.description ?? row.original.reason ?? '–'}
          </p>
          {row.original.manager_comment && (
            <p className="text-xs text-gray-400 truncate mt-0.5">
              {isAr ? 'تعليق المدير: ' : 'Manager: '}{row.original.manager_comment}
            </p>
          )}
        </div>
      ),
    }),
    col.accessor(row => row.date ?? row.start_date ?? row.created_at, {
      id:     'date',
      header: isAr ? 'التاريخ' : 'Date',
      cell:   info => (
        <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
          {fmtDate(info.getValue(), isAr)}
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
      isLoading={isLoading}
      emptyText={isAr ? 'لا توجد طلبات بعد' : 'No requests yet'}
      withCard={false}
    />
  );
}
