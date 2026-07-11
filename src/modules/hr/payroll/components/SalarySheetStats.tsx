import type { ReactNode } from 'react';
import {
  BadgeDollarSign, TrendingDown, Gift, Clock, Sparkles, Users, Wallet,
} from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { formatMoney } from '../utils/salaryMoney.utils';
import type { SalarySheetSummary } from '../types/payroll.types';

interface Props {
  summary: SalarySheetSummary | null | undefined;
  isAr:    boolean;
}

const EMPTY_TOTALS = {
  basicSalary: 0,
  deductions:  0,
  rewards:     0,
  overtime:    0,
  bonus:       0,
  netSalary:   0,
};

export function SalarySheetStats({ summary, isAr }: Props) {
  const totals = summary?.totals ?? EMPTY_TOTALS;
  const count  = summary?.employeeCount ?? 0;
  const month  = summary?.financialMonth;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card padding="lg" className="lg:col-span-1 bg-gradient-to-br from-[#A0CD39]/20 to-transparent dark:from-[#A0CD39]/10 border-[#A0CD39]/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {isAr ? 'إجمالي الرواتب' : 'Total Net Salaries'}
            </p>
            {month && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5" dir="ltr">
                {month}
              </p>
            )}
            <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {formatMoney(totals.netSalary, isAr)}
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Users size={13} />
              {isAr ? `${count} موظف` : `${count} employees`}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#A0CD39]/25 text-[#709028]">
            <Wallet size={20} />
          </div>
        </div>
      </Card>

      <Card overflow className="lg:col-span-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y sm:divide-y-0 divide-x-reverse divide-gray-100 dark:divide-gray-700">
          <MiniStat
            label={isAr ? 'الأساسي' : 'Basic'}
            value={formatMoney(totals.basicSalary, isAr)}
            icon={<BadgeDollarSign size={15} className="text-gray-400" />}
          />
          <MiniStat
            label={isAr ? 'الخصومات' : 'Deductions'}
            value={formatMoney(totals.deductions, isAr)}
            valueClass="text-red-600 dark:text-red-400"
            icon={<TrendingDown size={15} className="text-red-400" />}
          />
          <MiniStat
            label={isAr ? 'المكافآت' : 'Rewards'}
            value={formatMoney(totals.rewards, isAr)}
            valueClass="text-[#709028] dark:text-[#A0CD39]"
            icon={<Gift size={15} className="text-[#709028]" />}
          />
          <MiniStat
            label={isAr ? 'الإضافي' : 'Overtime'}
            value={formatMoney(totals.overtime, isAr)}
            valueClass="text-[#709028] dark:text-[#A0CD39]"
            icon={<Clock size={15} className="text-[#709028]" />}
          />
          <MiniStat
            label={isAr ? 'البونص' : 'Bonus'}
            value={formatMoney(totals.bonus, isAr)}
            valueClass="text-[#709028] dark:text-[#A0CD39]"
            icon={<Sparkles size={15} className="text-[#709028]" />}
          />
          <MiniStat
            label={isAr ? 'الصافي' : 'Net'}
            value={formatMoney(totals.netSalary, isAr)}
            valueClass="font-bold text-gray-900 dark:text-gray-100"
            icon={<Wallet size={15} className="text-[#709028]" />}
          />
        </div>
      </Card>
    </div>
  );
}

function MiniStat({
  label, value, valueClass = 'text-gray-800 dark:text-gray-100', icon,
}: {
  label:       string;
  value:       string;
  valueClass?: string;
  icon:        ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-sm tabular-nums ${valueClass}`}>{value}</p>
    </div>
  );
}
