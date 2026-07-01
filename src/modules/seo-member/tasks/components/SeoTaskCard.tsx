import { Play, Square, Tag, FolderOpen, CalendarClock } from 'lucide-react';
import { Badge }        from '@/shared/components/ui/Badge';
import { Button }       from '@/shared/components/ui/Button';
import { Card }         from '@/shared/components/ui/Card';
import { useTaskTimer } from '@/app/layouts/components/TaskTimerContext';
import { useSeoTaskCard } from './useSeoTaskCard';
import type { SeoTaskCardProps } from './SeoTaskCard.types';

export function SeoTaskCard({ task, isAr, onDetails }: SeoTaskCardProps) {
  const { status, priority, taskNum, deadline, empTask } = useSeoTaskCard(task, isAr);
  const { activeTask, startTimer, stopTimer } = useTaskTimer();
  const isActive = activeTask?.id === String(task.id);

  return (
    <Card
      padding="md"
      className={[
        'transition-all',
        isActive
          ? 'border-brand-400 shadow-md shadow-brand-100 dark:shadow-brand-900/20'
          : 'hover:shadow-md',
      ].join(' ')}
    >
      <div className="space-y-2.5">

        {/* Row 1: title + taskNum | status badge */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-gray-800 dark:text-gray-100 truncate">{task.title}</span>
            <span className="text-sm text-gray-400 dark:text-gray-500 tabular-nums shrink-0">{taskNum}</span>
          </div>
          <Badge
            label={isAr ? status.ar : status.en}
            variant={status.variant}
            icon={<span className="w-1.5 h-1.5 rounded-full bg-current" />}
          />
        </div>

        {/* Row 2: task type | phase */}
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
          <span className="flex items-center gap-1.5">
            <Tag size={14} className="text-gray-400 shrink-0" />
            {task.taskTypeLabel}
          </span>
          {task.phase && (
            <span className="flex items-center gap-1.5">
              <FolderOpen size={14} className="text-gray-400 shrink-0" />
              {task.phase}
            </span>
          )}
        </div>

        {/* Row 3: priority + deadline | timer + details */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              label={isAr ? priority.ar : priority.en}
              variant={priority.variant}
              icon={<span className="w-1.5 h-1.5 rounded-full bg-current" />}
            />
            <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
              <CalendarClock size={14} className="text-brand-500 shrink-0" />
              {isAr ? `التسليم: ${deadline}` : `Due: ${deadline}`}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isActive ? (
              <Button
                variant="danger"
                size="sm"
                startIcon={<Square size={13} fill="currentColor" />}
                onClick={() => stopTimer()}
              >
                {isAr ? 'إيقاف' : 'Stop'}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                startIcon={<Play size={13} />}
                onClick={() => startTimer(empTask)}
              >
                {isAr ? 'بدء المؤقت' : 'Start Timer'}
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onDetails?.(task.id)}
            >
              {isAr ? 'تفاصيل' : 'Details'}
            </Button>
          </div>
        </div>

      </div>
    </Card>
  );
}
