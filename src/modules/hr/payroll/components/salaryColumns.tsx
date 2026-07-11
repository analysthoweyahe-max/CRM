import { createColumnHelper } from '@tanstack/react-table';
import { Avatar } from '@/shared/components/ui/Avatar';
import type { ApiSalaryRow } from '../types/payroll.types';

const col = createColumnHelper<ApiSalaryRow>();

const AVATAR_COLORS = [
  'bg-red-400', 'bg-blue-400', 'bg-purple-400', 'bg-orange-400',
  'bg-green-500', 'bg-teal-400', 'bg-yellow-500', 'bg-pink-400',
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function formatMoney(amount: number, isAr: boolean): string {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  const formatted = safe.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${isAr ? 'ج.م' : 'EGP'}`;
}

function moneyCell(amount: number, isAr: boolean, tone?: 'danger' | 'success' | 'net') {
  const toneClass =
    tone === 'danger'  ? 'text-red-600 dark:text-red-400' :
    tone === 'success' ? 'text-[#709028] dark:text-[#A0CD39]' :
    tone === 'net'     ? 'text-gray-900 dark:text-gray-100 font-bold' :
                         'text-gray-700 dark:text-gray-300';

  return (
    <span className={`text-sm tabular-nums ${toneClass}`}>
      {formatMoney(amount, isAr)}
    </span>
  );
}

export function getSalaryColumns(isAr: boolean) {
  return [
    col.accessor('name', {
      id:     'employee',
      header: isAr ? 'الموظف' : 'Employee',
      cell:   ({ row }) => {
        const name   = row.original.name ?? '';
        const number = row.original.employeeNumber ?? '';
        return (
          <div className="flex items-center gap-3">
            <Avatar
              initial={name ? name.trim().charAt(0).toUpperCase() : '?'}
              color={name ? avatarColor(name) : 'bg-gray-400'}
              size="md"
            />
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{name || '—'}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500" dir="ltr">{number || '—'}</p>
            </div>
          </div>
        );
      },
    }),
    col.accessor('department', {
      id:     'department',
      header: isAr ? 'القسم' : 'Department',
      cell:   (i) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">{i.getValue() || '—'}</span>
      ),
    }),
    col.accessor('basicSalary', {
      id:     'basicSalary',
      header: isAr ? 'الراتب الأساسي' : 'Basic Salary',
      cell:   (i) => moneyCell(i.getValue() ?? 0, isAr),
    }),
    col.accessor('deductions', {
      id:     'deductions',
      header: isAr ? 'الخصومات' : 'Deductions',
      cell:   (i) => moneyCell(i.getValue() ?? 0, isAr, 'danger'),
    }),
    col.accessor('rewards', {
      id:     'rewards',
      header: isAr ? 'المكافآت' : 'Rewards',
      cell:   (i) => moneyCell(i.getValue() ?? 0, isAr, 'success'),
    }),
    col.accessor('overtime', {
      id:     'overtime',
      header: isAr ? 'العمل الإضافي' : 'Overtime',
      cell:   (i) => moneyCell(i.getValue() ?? 0, isAr, 'success'),
    }),
    col.accessor('bonus', {
      id:     'bonus',
      header: isAr ? 'البونص' : 'Bonus',
      cell:   (i) => moneyCell(i.getValue() ?? 0, isAr, 'success'),
    }),
    col.accessor('netSalary', {
      id:     'netSalary',
      header: isAr ? 'الراتب الفعلي' : 'Net Salary',
      cell:   (i) => moneyCell(i.getValue() ?? 0, isAr, 'net'),
    }),
  ];
}
