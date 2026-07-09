import { useMemo } from 'react';
import { Eye, Trash2 } from 'lucide-react';
import { useReactTable, getCoreRowModel, createColumnHelper } from '@tanstack/react-table';
import { DataTable } from '@/shared/components/tables/DataTable';
import { Avatar }    from '@/shared/components/ui/Avatar';
import { Badge }     from '@/shared/components/ui/Badge';
import { Button }    from '@/shared/components/ui/Button';
import type { AdminEmployee } from '../types/adminEmployee.types';

const STATUS_VARIANT: Record<AdminEmployee['status'], 'success' | 'error' | 'warning'> = {
  active:   'success',
  inactive: 'error',
  pending:  'warning',
};

const col = createColumnHelper<AdminEmployee>();

interface Props {
  employees:    AdminEmployee[];
  isAr:         boolean;
  page:         number;
  pageCount:    number;
  total:        number;
  pageSize:     number;
  onPage:       (page: number) => void;
  onRowClick:   (id: string) => void;
  selected?:    Set<string>;
  onToggleOne?: (id: string) => void;
  onToggleAll?: () => void;
  onDelete?:    (emp: AdminEmployee) => void;
}

export function AdminEmployeeTable({
  employees, isAr, page, pageCount, total, pageSize, onPage, onRowClick,
  selected, onToggleOne, onToggleAll, onDelete,
}: Props) {
  const selectable = !!(selected && onToggleOne && onToggleAll);

  const columns = useMemo(() => {
    const cols = [];

    if (selectable) {
      const allOnPageSelected = employees.length > 0 && employees.every(e => selected!.has(e.id));
      cols.push(
        col.display({
          id:     'select',
          header: () => (
            <input
              type="checkbox"
              checked={allOnPageSelected}
              onChange={onToggleAll}
              aria-label={isAr ? 'تحديد الكل' : 'Select all'}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#A0CD39] focus:ring-[#A0CD39]/40"
            />
          ),
          cell: ({ row }) => (
            <input
              type="checkbox"
              checked={selected!.has(row.original.id)}
              onChange={() => onToggleOne!(row.original.id)}
              aria-label={isAr ? 'تحديد الموظف' : 'Select employee'}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#A0CD39] focus:ring-[#A0CD39]/40"
            />
          ),
        }),
      );
    }

    cols.push(
      col.display({
        id:     'employee',
        header: isAr ? 'الموظف' : 'Employee',
        cell:   ({ row }) => (
          <button
            type="button"
            onClick={() => onRowClick(row.original.id)}
            className="flex items-center gap-2.5 text-start hover:opacity-80 transition-opacity"
          >
            <Avatar initial={row.original.avatarInitial} color={row.original.avatarColor} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{row.original.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{row.original.email}</p>
            </div>
          </button>
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
        id:     'actions',
        header: isAr ? 'إجراءات' : 'Actions',
        cell:   ({ row }) => (
          <div className="flex items-center gap-1">
            <Button variant="icon" aria-label={isAr ? 'عرض' : 'View'} onClick={() => onRowClick(row.original.id)}>
              <Eye size={16} />
            </Button>
            {onDelete && (
              <Button
                variant="icon-danger"
                aria-label={isAr ? 'حذف الموظف' : 'Delete employee'}
                onClick={() => onDelete(row.original)}
              >
                <Trash2 size={15} />
              </Button>
            )}
          </div>
        ),
      }),
    );

    return cols;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAr, onRowClick, employees, selected, selectable, onDelete]);

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
