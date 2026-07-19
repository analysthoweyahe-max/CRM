import { useMemo } from 'react';
import { X } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import { Badge } from '@/shared/components/ui/Badge';
import { DataTable, type ServerPagination } from '@/shared/components/tables/DataTable';
import { formatDateFull } from '@/shared/utils/date.utils';
import {
  ADMIN_REQUEST_STATUS_MAP,
  type AdminRequest,
  type AdminRequestStatus,
} from '../types/adminRequest.types';

const col = createColumnHelper<AdminRequest>();

interface Props {
  requests:          AdminRequest[];
  isLoading:         boolean;
  isAr:              boolean;
  onCancel?:         (id: string) => void;
  cancelling?:       string | null;
  serverPagination?: ServerPagination;
}

function fmtRange(start: string | null, end: string | null, isAr: boolean) {
  if (!start && !end) return '–';
  if (start && end && start !== end) {
    return `${formatDateFull(start, isAr)} – ${formatDateFull(end, isAr)}`;
  }
  return formatDateFull(start || end || '', isAr);
}

export function AdminRequestsTable({
  requests,
  isLoading,
  isAr,
  onCancel,
  cancelling,
  serverPagination,
}: Props) {
  const columns = useMemo((): ColumnDef<AdminRequest, unknown>[] => {
    const cols: ColumnDef<AdminRequest, unknown>[] = [
      col.accessor('requestTypeLabel', {
        id:     'type',
        header: isAr ? 'النوع' : 'Type',
        cell:   (info) => (
          <span className="font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
            {info.getValue()}
          </span>
        ),
      }),
      col.accessor('title', {
        id:     'title',
        header: isAr ? 'العنوان' : 'Title',
        cell:   ({ row }) => (
          <div className="max-w-xs">
            <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{row.original.title}</p>
            {row.original.description && (
              <p className="text-xs text-gray-400 truncate">{row.original.description}</p>
            )}
          </div>
        ),
      }),
      col.display({
        id:     'date',
        header: isAr ? 'التاريخ' : 'Date',
        cell:   ({ row }) => (
          <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap text-sm">
            {fmtRange(row.original.startDate, row.original.endDate, isAr)}
          </span>
        ),
      }),
      col.accessor('status', {
        header: isAr ? 'الحالة' : 'Status',
        cell:   (info) => {
          const status = info.getValue() as AdminRequestStatus;
          const s = ADMIN_REQUEST_STATUS_MAP[status] ?? ADMIN_REQUEST_STATUS_MAP.pending;
          return <Badge label={isAr ? s.ar : s.en} variant={s.variant} />;
        },
      }),
    ];

    if (onCancel) {
      cols.push(
        col.display({
          id:     'actions',
          header: isAr ? 'إجراء' : 'Actions',
          cell:   ({ row }) => {
            if (!row.original.actions?.canCancel) return null;
            const busy = cancelling === row.original.id;
            return (
              <button
                type="button"
                disabled={busy}
                onClick={() => onCancel(row.original.id)}
                className="inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600 disabled:opacity-50"
              >
                <X size={13} />
                {busy ? (isAr ? 'جاري…' : '…') : (isAr ? 'إلغاء' : 'Cancel')}
              </button>
            );
          },
        }),
      );
    }

    return cols;
  }, [isAr, onCancel, cancelling]);

  const table = useReactTable({
    data:            requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <DataTable
      table={table}
      isAr={isAr}
      isLoading={isLoading}
      emptyText={isAr ? 'لا توجد طلبات بعد' : 'No requests yet'}
      withCard={false}
      serverPagination={serverPagination}
    />
  );
}
