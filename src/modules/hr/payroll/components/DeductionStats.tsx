import { type ReactElement } from 'react';
import { BadgeDollarSign, Zap, PenLine } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { formatMoneyAmount } from '@/shared/utils/number.utils';

interface DeductionStatsProps {
  total:   number | null | undefined;
  autoC:   number;
  manualC: number;
  isAr:    boolean;
}

export function DeductionStats({ total, autoC, manualC, isAr }: DeductionStatsProps) {
  return (
    <Card overflow>
      <div className="grid grid-cols-2 sm:grid-cols-3 divide-x divide-y sm:divide-y-0 divide-x-reverse divide-gray-100 dark:divide-gray-700">
        <StatItem
          label={isAr ? 'إجمالي الخصومات' : 'Total Deductions'}
          value={formatMoneyAmount(total, isAr)}
          valueClass="text-red-500 dark:text-red-400"
          icon={<BadgeDollarSign size={17} className="text-red-400" />}
        />
        <StatItem
          label={isAr ? 'خصومات تلقائية' : 'Automatic'}
          value={String(autoC)}
          icon={<Zap size={17} className="text-brand-500" />}
        />
        <StatItem
          label={isAr ? 'خصومات يدويّة' : 'Manual'}
          value={String(manualC)}
          icon={<PenLine size={17} className="text-gray-400" />}
        />
      </div>
    </Card>
  );
}

function StatItem({ label, value, valueClass = 'text-gray-900 dark:text-gray-100', icon }: {
  label:       string;
  value:       string;
  valueClass?: string;
  icon:        ReactElement;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-5 px-4 text-center">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`text-xl font-bold ${valueClass}`}>{value}</p>
    </div>
  );
}
