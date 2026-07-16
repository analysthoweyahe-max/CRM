import { Card } from '@/shared/components/ui/Card';
import { C_GREEN } from './progressCharts.config';

export interface PhaseProgressItem {
  label:    string;
  progress: number;
}

interface Props {
  isAr:    boolean;
  /** Real phase progress — omit or pass [] to hide the card. */
  phases?: PhaseProgressItem[];
}

export function PhaseProgressCard({ isAr, phases }: Props) {
  if (!phases?.length) return null;

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-5 text-end">
        {isAr ? 'الإنجاز حسب المرحلة' : 'Progress by Phase'}
      </h3>

      <div className="space-y-3.5">
        {phases.map(phase => (
          <div key={phase.label} className="flex items-center gap-3">
            <span className="text-xs text-gray-600 dark:text-gray-300 w-28 shrink-0 truncate" title={phase.label}>
              {phase.label}
            </span>
            <div className="flex-1 h-2.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${phase.progress}%`,
                  backgroundColor: phase.progress > 0 ? C_GREEN : 'transparent',
                }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 w-8 text-end shrink-0">
              {phase.progress}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
