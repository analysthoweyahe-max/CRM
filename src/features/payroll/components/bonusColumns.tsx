import { createColumnHelper } from '@tanstack/react-table';
import { Zap, PenLine } from 'lucide-react';
import { Avatar } from '@/shared/components/ui/Avatar';
import { Badge } from '@/shared/components/ui/Badge';

export interface Bonus {
  id:             string;
  employeeName:   string;
  department:     string;
  initial:        string;
  avatarColor:    string;
  type:           string;
  amount:         number;
  reason:         string;
  date:           string;
  financialMonth: string;
  source:         'auto' | 'manual';
}

const col = createColumnHelper<Bonus>();

export function getBonusColumns(isAr: boolean) {
  return [
    col.accessor('employeeName', {
      header: isAr ? 'الموظف' : 'Employee',
      cell: ({ row: r }) => (
        <div className="flex items-center gap-3">
          <Avatar initial={r.original.initial} color={r.original.avatarColor} size="md" />
          <div>
            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{r.original.employeeName}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">{r.original.department}</p>
          </div>
        </div>
      ),
    }),
    col.accessor('type', {
      header: isAr ? 'نوع الكافئة' : 'Type',
      cell: (i) => <span className="text-sm text-gray-700 dark:text-gray-300">{i.getValue()}</span>,
    }),
    col.accessor('amount', {
      header: isAr ? 'المبلغ' : 'Amount',
      cell: (i) => (
        <span className="text-sm font-semibold text-brand-500 dark:text-brand-400">
          +{i.getValue().toLocaleString('ar-EG')} {isAr ? 'ج.م' : 'EGP'}
        </span>
      ),
    }),
    col.accessor('reason', {
      header: isAr ? 'السبب' : 'Reason',
      enableSorting: false,
      cell: (i) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 max-w-50 block truncate" title={i.getValue()}>
          {i.getValue()}
        </span>
      ),
    }),
    col.accessor('date', {
      header: isAr ? 'التاريخ' : 'Date',
      cell: (i) => <span className="text-sm text-gray-600 dark:text-gray-400">{i.getValue()}</span>,
    }),
    col.accessor('financialMonth', {
      header: isAr ? 'الشهر المالي' : 'Month',
      enableSorting: false,
      cell: (i) => <span className="text-sm text-gray-600 dark:text-gray-400">{i.getValue()}</span>,
    }),
    col.accessor('source', {
      header: isAr ? 'المصدر' : 'Source',
      enableSorting: false,
      cell: (i) => i.getValue() === 'auto' ? (
        <Badge label={isAr ? 'تلقائي' : 'Auto'} variant="brand" icon={<Zap size={11} />} />
      ) : (
        <Badge label={isAr ? 'يدوي' : 'Manual'} variant="gray" icon={<PenLine size={11} />} />
      ),
    }),
  ];
}
