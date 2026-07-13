import type { ReactNode } from 'react';
import { BadgeDollarSign, Clock, Gift, Sparkles, TrendingDown, Wallet } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { formatMoney } from '../utils/workOverview.utils';
import type { WorkOverviewSalary } from '../types/workOverview.types';

interface WorkOverviewSalaryCardProps {
  salary:     WorkOverviewSalary | undefined;
  isAr:       boolean;
  isLoading?: boolean;
}

export function WorkOverviewSalaryCard({ salary, isAr, isLoading }: WorkOverviewSalaryCardProps) {
  if (isLoading) {
    return <div className="h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />;
  }

  if (!salary) return null;

  return (
    <div>
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-3">
        {isAr ? 'الراتب' : 'Salary'}
      </h2>
      <Card overflow>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-x-reverse divide-gray-100 dark:divide-gray-700">
          <MiniStat
            label={isAr ? 'الأساسي' : 'Basic'}
            value={formatMoney(salary.basicSalary, isAr)}
            icon={<BadgeDollarSign size={15} className="text-gray-400" />}
          />
          <MiniStat
            label={isAr ? 'الخصومات' : 'Deductions'}
            value={formatMoney(salary.deductions, isAr)}
            valueClass="text-red-600 dark:text-red-400"
            icon={<TrendingDown size={15} className="text-red-400" />}
          />
          <MiniStat
            label={isAr ? 'المكافآت' : 'Rewards'}
            value={formatMoney(salary.rewards, isAr)}
            valueClass="text-[#709028] dark:text-[#A0CD39]"
            icon={<Gift size={15} className="text-[#709028]" />}
          />
          <MiniStat
            label={isAr ? 'الإضافي' : 'Overtime'}
            value={formatMoney(salary.overtime, isAr)}
            valueClass="text-[#709028] dark:text-[#A0CD39]"
            icon={<Clock size={15} className="text-[#709028]" />}
          />
          <MiniStat
            label={isAr ? 'البونص' : 'Bonus'}
            value={formatMoney(salary.bonus, isAr)}
            valueClass="text-[#709028] dark:text-[#A0CD39]"
            icon={<Sparkles size={15} className="text-[#709028]" />}
          />
          <MiniStat
            label={isAr ? 'الصافي' : 'Net'}
            value={formatMoney(salary.netSalary, isAr)}
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
