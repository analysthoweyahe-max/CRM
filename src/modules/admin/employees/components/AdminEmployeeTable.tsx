import { useMemo } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Avatar }    from '@/shared/components/ui/Avatar';
import { Badge }     from '@/shared/components/ui/Badge';
import { Button }    from '@/shared/components/ui/Button';
import type { AdminEmployee } from '../types/adminEmployee.types';

const STATUS_VARIANT: Record<AdminEmployee['status'], 'success' | 'error' | 'warning'> = {
  active:   'success',
  disabled: 'error',
  pending:  'warning',
};

const col = createColumnHelper<AdminEmployee>();

interface Props {
  employees: AdminEmployee[];
  isAr:      boolean;
  page:      number;
  pageCount: number;
  total:     number;
  pageSize:  number;
  onPage:    (page: number) => void;
}

export function AdminEmployeeTable({ employees, isAr, page, pageCount, total, pageSize, onPage }: Props) {
  const columns = useMemo(() => [
    col.display({
      id:     'employee',
      header: isAr ? 'الموظف' : 'Employee',
      cell:   ({ row }) => (
        <div className="flex items-center gap-2.5">
          <Avatar initial={row.original.avatarInitial} color={row.original.avatarColor} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{row.original.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{row.original.email}</p>
          </div>
        </div>
      ),
    }),
    col.accessor('department', { header: isAr ? 'القسم' : 'Department' }),
    col.accessor('jobTitle',   { header: isAr ? 'المسمى الوظيفي' : 'Job Title' }),
    col.accessor('role', {
      header: isAr ? 'الدور' : 'Role',
      cell:   info => <Badge label={info.getValue()} variant="gray" />,
    }),
    col.accessor('status', {
      header: isAr ? 'الحالة' : 'Status',
      cell:   info => (
        <Badge
          label={isAr ? info.row.original.statusLabelAr : info.row.original.statusLabelEn}
          variant={STATUS_VARIANT[info.getValue()]}
        />
      ),
    }),
    col.display({
      id:     'lastLogin',
      header: isAr ? 'آخر دخول' : 'Last Login',
      cell:   ({ row }) => (
        <span className="text-gray-500 dark:text-gray-400">
          {isAr ? row.original.lastLoginAr : row.original.lastLoginEn}
        </span>
      ),
    }),
    col.display({
      id:     'actions',
      header: isAr ? 'إجراءات' : 'Actions',
      cell:   () => (
        <Button variant="icon" aria-label={isAr ? 'إجراءات' : 'Actions'}>
          <MoreHorizontal size={16} />
        </Button>
      ),
    }),
  ], [isAr]);

  const table = useReactTable({
    data: employees,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const firstRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow  = Math.min(page * pageSize, total);

  return (
    <DataTable
      table={table}
      isAr={isAr}
      emptyText={isAr ? 'لا توجد نتائج' : 'No results found'}
      serverPagination={{
        page, lastPage: pageCount, total, firstRow, lastRow,
        onPrev: () => onPage(Math.max(1, page - 1)),
        onNext: () => onPage(Math.min(pageCount, page + 1)),
        onPage: idx => onPage(idx + 1),
      }}
    />
  );
}
