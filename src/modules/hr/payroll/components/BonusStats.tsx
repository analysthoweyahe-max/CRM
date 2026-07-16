import type { ReactNode } from 'react';
import { BadgeDollarSign, PenLine, Zap } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import { formatMoneyAmount } from '@/shared/utils/number.utils';

interface BonusStatsProps {
  total:   number | null | undefined;
  manualC: number;
  autoC:   number;
  isAr:    boolean;
}

export function BonusStats({ total, manualC, autoC, isAr }: BonusStatsProps) {
  return (
    <Card overflow>
      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        <StatRow
          label={isAr ? 'إجمالي المكافآت' : 'Total Bonuses'}
          value={formatMoneyAmount(total, isAr)}
          valueClass="text-xl font-bold text-brand-500 dark:text-brand-400"
          icon={<BadgeDollarSign size={17} className="text-brand-400" />}
        />
        <StatRow
          label={isAr ? 'المكافآت يدويا' : 'Manual Bonuses'}
          value={String(manualC)}
          icon={<PenLine size={17} className="text-gray-400" />}
        />
        <StatRow
          label={isAr ? 'المكافآت التلقائية' : 'Automatic Bonuses'}
          value={String(autoC)}
          icon={<Zap size={17} className="text-brand-500" />}
        />
      </div>
    </Card>
  );
}

function StatRow({ label, value, valueClass = 'text-xl font-bold text-gray-900 dark:text-gray-100', icon }: {
  label:       string;
  value:       string;
  valueClass?: string;
  icon:        ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
        {icon}
        <span>{label}</span>
      </div>
      <p className={valueClass}>{value}</p>
    </div>
  );
}
