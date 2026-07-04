import { Play, Square, CalendarClock } from 'lucide-react';
import { Badge }        from '@/shared/components/ui/Badge';
import { Button }       from '@/shared/components/ui/Button';
import { Card }         from '@/shared/components/ui/Card';
import { useTaskTimer } from '@/app/layouts/components/TaskTimerContext';
import { useSeoTaskCard } from '@/modules/seo-member/tasks/components/useSeoTaskCard';
import type { SeoTask } from '@/modules/seo-member/tasks/types/seoTask.types';

interface Props {
  task:       SeoTask;
  isAr:       boolean;
  onDetails?: (id: number) => void;
}

export function TodayTaskCard({ task, isAr, onDetails }: Props) {
  const { priority, taskNum, deadline, empTask } = useSeoTaskCard(task, isAr);
  const { activeTask, startTimer, stopTimer }    = useTaskTimer();
  const isActive = activeTask?.id === String(task.id);

  return (
    <Card
      padding="md"
      className={isActive ? 'border-brand-400 shadow-md shadow-brand-100 dark:shadow-brand-900/20' : ''}
    >
      <div className="space-y-1.5">
        <Badge
          label={isAr ? priority.ar : priority.en}
          variant={priority.variant}
          icon={<span className="w-1.5 h-1.5 rounded-full bg-current" />}
        />
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">{task.title}</span>
          <span className="text-sm text-gray-400 dark:text-gray-500 tabular-nums shrink-0">{taskNum}</span>
        </div>
        {task.phase && (
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{task.phase}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-3 flex-wrap">
        <div className="flex items-center gap-2">
          {isActive ? (
            <Button variant="danger" size="sm" startIcon={<Square size={13} fill="currentColor" />} onClick={() => stopTimer()}>
              {isAr ? 'إيقاف' : 'Stop'}
            </Button>
          ) : (
            <Button variant="primary" size="sm" startIcon={<Play size={13} />} onClick={() => startTimer(empTask)}>
              {isAr ? 'بدء المؤقت' : 'Start Timer'}
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => onDetails?.(task.id)}>
            {isAr ? 'تفاصيل' : 'Details'}
          </Button>
        </div>
        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <CalendarClock size={14} className="text-brand-500 shrink-0" />
          {isAr ? `التسليم: ${deadline}` : `Due: ${deadline}`}
        </span>
      </div>
    </Card>
  );
}
