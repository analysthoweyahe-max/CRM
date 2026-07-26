import { colorForKey } from '@/shared/components/kanban/kanbanColors';
import type { TaskBrief } from '../types/taskBrief.types';

interface Props {
  task: TaskBrief;
  isAr: boolean;
}

const PRIORITY_LABEL: Record<string, { ar: string; en: string; color: string }> = {
  urgent: { ar: 'عاجل',    en: 'Urgent', color: '#EF4444' },
  high:   { ar: 'عالية',   en: 'High',   color: '#F97316' },
  normal: { ar: 'متوسطة',  en: 'Normal', color: '#3B82F6' },
  medium: { ar: 'متوسطة',  en: 'Medium', color: '#3B82F6' },
  low:    { ar: 'منخفضة',  en: 'Low',    color: '#9CA3AF' },
};

export function TaskBriefCard({ task, isAr }: Props) {
  const statusColor = task.status.color ?? colorForKey(task.status.key);
  const priority = task.priority ? PRIORITY_LABEL[task.priority] : null;

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
          {task.title}
        </h4>
        <span
          className="shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
          {task.status.label}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
        <span className="truncate">
          {task.project ? task.project.name : (isAr ? 'بدون مشروع' : 'No project')}
        </span>
        {task.dueDate && (
          <span className="shrink-0">
            {new Date(task.dueDate).toLocaleDateString(isAr ? 'ar' : 'en')}
          </span>
        )}
      </div>

      {(priority || task.assigneeName) && (
        <div className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700/60 pt-2.5">
          {priority ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: priority.color }} />
              {isAr ? priority.ar : priority.en}
            </span>
          ) : <span />}
          {task.assigneeName && <span className="truncate">{task.assigneeName}</span>}
        </div>
      )}
    </div>
  );
}
