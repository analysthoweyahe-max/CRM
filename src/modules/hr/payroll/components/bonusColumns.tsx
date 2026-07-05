import { createColumnHelper } from '@tanstack/react-table';
import { Zap, PenLine } from 'lucide-react';
import { Avatar }  from '@/shared/components/ui/Avatar';
import { Badge }   from '@/shared/components/ui/Badge';
import { getInitial, getAvatarColor } from '@/modules/hr/employees/types/employee.types';
import type { ApiBonus } from '../types/payroll.types';

const col = createColumnHelper<ApiBonus>();

export function getBonusColumns(isAr: boolean) {
  return [
    col.accessor('employeeName', {
      id:     'employee',
      header: isAr ? 'الموظف' : 'Employee',
      cell:   ({ row }) => {
        const name    = row.original.employeeName ?? '';
        const dept    = row.original.department ?? '–';
        const initial = name ? getInitial(name) : '?';
        const color   = name ? getAvatarColor(name) : 'bg-gray-400';
        return (
          <div className="flex items-center gap-3">
            <Avatar initial={initial} color={color} size="md" />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{dept}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor('adjustmentTypeLabel', {
      id:     'adjustmentTypeLabel',
      header: isAr ? 'نوع المكافأة' : 'Type',
      cell:   (i) => <span className="text-sm text-gray-700 dark:text-gray-300">{i.getValue()}</span>,
    }),
    col.accessor('amount', {
      id:     'amount',
      header: isAr ? 'المبلغ' : 'Amount',
      cell:   (i) => (
        <span className="text-sm font-semibold text-[#709028] dark:text-[#A0CD39]">
          +{i.getValue().toLocaleString('ar-EG')} {isAr ? 'ج.م' : 'EGP'}
        </span>
      ),
    }),
    col.accessor('reason', {
      id:            'reason',
      header:        isAr ? 'السبب' : 'Reason',
      enableSorting: false,
      cell:          (i) => (
        <span className="text-sm text-gray-500 dark:text-gray-400 max-w-50 block truncate" title={i.getValue() ?? ''}>
          {i.getValue() ?? '–'}
        </span>
      ),
    }),
    col.accessor('financialMonth', {
      id:            'financialMonth',
      header:        isAr ? 'الشهر المالي' : 'Month',
      enableSorting: false,
      cell:          (i) => <span className="text-sm text-gray-600 dark:text-gray-400">{i.getValue() ?? '–'}</span>,
    }),
    col.accessor('source', {
      id:            'source',
      header:        isAr ? 'المصدر' : 'Source',
      enableSorting: false,
      cell:          (i) => i.getValue() === 'auto' ? (
        <Badge label={isAr ? 'تلقائي' : 'Auto'}   variant="brand" icon={<Zap     size={11} />} />
      ) : (
        <Badge label={isAr ? 'يدوي'   : 'Manual'} variant="gray"  icon={<PenLine size={11} />} />
      ),
    }),
  ];
}
