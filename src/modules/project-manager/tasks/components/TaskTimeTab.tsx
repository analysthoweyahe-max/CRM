import { useMemo }         from 'react';
import { Clock }             from 'lucide-react';
import { useReactTable, getCoreRowModel, getFilteredRowModel, createColumnHelper } from '@tanstack/react-table';
import { DataTable }         from '@/shared/components/tables/DataTable';
import type { TimeSession }  from '../types/taskModal.types';

interface Props {
  sessions:        TimeSession[];
  totalHours:      number;
  estimatedHours:  number;
  remainingHours:  number;
  progress:        number;
  isAr:            boolean;
}

const col = createColumnHelper<TimeSession>();

export function TaskTimeTab({ sessions, totalHours, estimatedHours, remainingHours, progress, isAr }: Props) {
  const columns = useMemo(() => [
    col.accessor('date',  { header: isAr ? 'التاريخ' : 'Date',         enableSorting: false }),
    col.accessor('from',  { header: isAr ? 'من'       : 'From',         enableSorting: false }),
    col.accessor('to',    { header: isAr ? 'إلى'      : 'To',           enableSorting: false }),
    col.accessor('hours', {
      header: isAr ? 'المدة (س)' : 'Duration (h)',
      cell:   info => (
        <span className="font-semibold text-[#709028] dark:text-[#A0CD39]">{info.getValue()}</span>
      ),
      enableSorting: false,
    }),
  ], [isAr]);

  const table = useReactTable({
    data:                sessions,
    columns,
    getCoreRowModel:     getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-end gap-2">
        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
          {isAr ? 'تتبع الوقت' : 'Time Tracking'}
        </h3>
        <Clock size={17} className="text-[#A0CD39]" />
      </div>

      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-right">
        {isAr ? 'الجلسات المسجلة' : 'Recorded Sessions'}
      </p>

      {/* Table */}
      <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        <DataTable table={table} isAr={isAr} withCard={false} />
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <p className="font-bold text-gray-900 dark:text-gray-100">
            {totalHours} {isAr ? 'ساعات' : 'hours'}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {isAr ? 'إجمالي الوقت المستهلك' : 'Total Time Spent'}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <p className="font-semibold text-[#709028] dark:text-[#A0CD39]">
            {remainingHours} {isAr ? `ساعات (من ${estimatedHours} ساعة)` : `hours (of ${estimatedHours}h)`}
          </p>
          <p className="text-gray-500 dark:text-gray-400">
            {isAr ? 'الوقت المتبقى' : 'Remaining Time'}
          </p>
        </div>

        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-[#A0CD39] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
