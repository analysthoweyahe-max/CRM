import { Card }     from '@/shared/components/ui/Card';
import { TaskCard } from './TaskCard';
import type { TaskListProps } from './TaskList.types';

function TaskCardSkeleton() {
  return (
    <Card padding="md">
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="h-5 w-24 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-600 animate-pulse" />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div className="h-4 w-40 rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 pt-1">
          <div className="h-8 w-28 rounded-lg bg-brand-100 dark:bg-brand-900/30 animate-pulse" />
          <div className="h-8 w-20 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse" />
          <div className="h-5 w-16 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse ms-auto" />
        </div>
      </div>
    </Card>
  );
}

export function TaskList({ tasks, isLoading, isAr }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400 dark:text-gray-500 text-sm">
        {isAr ? 'لا توجد مهام' : 'No tasks found'}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => <TaskCard key={task.id} task={task} isAr={isAr} />)}
    </div>
  );
}
