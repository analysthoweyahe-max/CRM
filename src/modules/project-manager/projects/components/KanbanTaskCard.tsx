import { Calendar, Trash2 } from 'lucide-react';
import { ImportantLinksDisplay } from '@/shared/components/form/ImportantLinksDisplay';
import type { Task, TaskPriority } from '../../tasks/types/task.types';

const PRIORITY_CONFIG: Record<TaskPriority, { ar: string; en: string; dot: string; badge: string }> = {
  urgent: { ar: 'عاجلة',   en: 'Urgent', dot: 'bg-red-600',   badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'         },
  high:   { ar: 'عالية',   en: 'High',   dot: 'bg-red-500',   badge: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'         },
  normal: { ar: 'متوسطة',  en: 'Normal', dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'  },
  low:    { ar: 'منخفضة',  en: 'Low',    dot: 'bg-gray-400',  badge: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'         },
};

interface Props {
  task:      Task;
  isAr:      boolean;
  onOpen:    (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export function KanbanTaskCard({ task, isAr, onOpen, onDelete }: Props) {
  const prio = PRIORITY_CONFIG[task.priority];

  return (
    <div
      onClick={() => onOpen(task)}
      className="group bg-white dark:bg-gray-800 rounded-xl p-3.5 shadow-sm
                 border border-gray-100 dark:border-gray-700/60
                 cursor-grab active:cursor-grabbing active:opacity-50
                 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600
                 transition-all duration-150 select-none"
    >
      {/* Top: task number + priority badge + delete */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-400 font-mono">{task.taskNumber}</span>
          {onDelete && (
            <button
              type="button"
              aria-label={isAr ? 'حذف المهمة' : 'Delete task'}
              title={isAr ? 'حذف المهمة' : 'Delete task'}
              onClick={e => { e.stopPropagation(); onDelete(task); }}
              className="opacity-0 group-hover:opacity-100 focus:opacity-100
                         text-gray-300 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400
                         transition-all duration-150"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${prio.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${prio.dot}`} />
          {isAr ? prio.ar : prio.en}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 leading-snug text-end">
        {task.title}
      </p>

      {!!task.importantLinks?.length && (
        <div className="mb-2 flex justify-end">
          <ImportantLinksDisplay links={task.importantLinks} isAr={isAr} compact />
        </div>
      )}

      {/* Phase */}
      {task.phaseName && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 text-end">
          {task.phaseName}
        </p>
      )}

      {/* Footer: due date + assignee */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
          <Calendar size={12} />
          <span>{task.dueDate}</span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{task.assigneeName}</span>
          <div className={`w-7 h-7 rounded-full ${task.assigneeColor} flex items-center justify-center
                           text-white text-xs font-bold shrink-0`}>
            {task.assigneeInitial}
          </div>
        </div>
      </div>
    </div>
  );
}
