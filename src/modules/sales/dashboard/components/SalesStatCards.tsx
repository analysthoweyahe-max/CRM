import { ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '@/shared/components/ui/Card';
import type { SalesStatItem } from '../hooks/useSalesDashboardMock';

interface Props {
  isAr:  boolean;
  stats: SalesStatItem[];
}

export function SalesStatCards({ isAr, stats }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const Icon  = stat.icon;
        const Trend = stat.direction === 'up' ? ArrowUp : ArrowDown;
        return (
          <Card
            key={stat.key}
            padding="md"
            style={{ animationDelay: `${i * 0.06}s` }}
            className="fade-in-up"
          >
            <div className="flex items-start justify-between gap-2">
              <span className={[
                'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                stat.tone === 'good'
                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                  : 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
              ].join(' ')}>
                <Trend size={11} />
                {stat.deltaPct}%
              </span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg}`}>
                <Icon size={17} className={stat.iconColor} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100 leading-none">
              {stat.value}
            </p>
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              {isAr ? stat.labelAr : stat.labelEn}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
