import { Play, Square, Briefcase, CalendarClock } from 'lucide-react';
import { useNavigate }   from 'react-router-dom';
import { Badge }         from '@/shared/components/ui/Badge';
import { Button }        from '@/shared/components/ui/Button';
import { Card }          from '@/shared/components/ui/Card';
import { useTaskTimer }  from '@/app/layouts/components/TaskTimerContext';
import { ROUTES }        from '@/app/router/routes';
import { useTaskCard }   from './useTaskCard';
import type { TaskCardProps } from './TaskCard.types';

export function TaskCard({ task, isAr, onDetails }: TaskCardProps) {
  const { status, priority, title, project, deadline, taskNum, empTask } = useTaskCard(task, isAr);
  const { activeTask, startTimer, stopTimer } = useTaskTimer();
  const navigate = useNavigate();
  const isActive = activeTask?.id === task.id;
  const handleDetails = onDetails ? () => onDetails(task.id) : () => navigate(ROUTES.EMPLOYEE.TASK_DETAIL(task.id));

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
        {/* Row 1: title+id (start→right in RTL) | status badge (end→left in RTL) */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800 dark:text-gray-100">{title}</span>
            <span className="text-sm text-gray-400 dark:text-gray-500 tabular-nums">{taskNum}</span>
          </div>
          <Badge
            label={isAr ? status.ar : status.en}
            variant={status.variant}
            icon={<span className="w-1.5 h-1.5 rounded-full bg-current" />}
          />
        </div>

        {/* Row 2: project */}
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <Briefcase size={14} className="text-gray-400 shrink-0" />
          <span>{isAr ? `المشروع: ${project}` : `Project: ${project}`}</span>
        </div>

        {/* Row 3: priority+deadline (start→right in RTL) | timer+details (end→left in RTL) */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
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
          <div className="flex items-center gap-2">
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
            <Button variant="secondary" size="sm" onClick={handleDetails}>
              {isAr ? 'تفاصيل' : 'Details'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
