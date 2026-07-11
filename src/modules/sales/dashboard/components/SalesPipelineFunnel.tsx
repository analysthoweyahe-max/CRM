import { Card } from '@/shared/components/ui/Card';
import type { SalesFunnelStage } from '../hooks/useSalesDashboardMock';

interface Props {
  isAr:   boolean;
  stages: SalesFunnelStage[];
}

export function SalesPipelineFunnel({ isAr, stages }: Props) {
  const max = Math.max(...stages.map(s => s.count), 1);

  return (
    <Card padding="md" className="fade-in-up h-full">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {isAr ? 'مسار المبيعات' : 'Sales Pipeline'}
      </h3>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 mb-4">
        {isAr ? 'عدد الصفقات في كل مرحلة' : 'Deal count per stage'}
      </p>

      <div className="space-y-3.5">
        {stages.map(stage => (
          <div key={stage.key}>
            <div className="flex items-center justify-between gap-2 mb-1 text-sm">
              <span className="font-semibold text-gray-800 dark:text-gray-100">{stage.count}</span>
              <span className="text-gray-500 dark:text-gray-400 truncate">
                {isAr ? stage.labelAr : stage.labelEn}
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700/60 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(stage.count / max) * 100}%`, backgroundColor: stage.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
