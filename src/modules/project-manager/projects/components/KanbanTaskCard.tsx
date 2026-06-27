import { Calendar } from 'lucide-react';
import type { Task, TaskPriority } from '../../tasks/types/task.types';

const PRIORITY_CONFIG: Record<TaskPriority, { ar: string; dot: string; badge: string }> = {
  high:   { ar: 'عالية',   dot: 'bg-red-500',   badge: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'       },
  medium: { ar: 'متوسطة',  dot: 'bg-amber-500', badge: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  low:    { ar: 'منخفضة',  dot: 'bg-gray-400',  badge: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'        },
};

interface Props {
  task:   Task;
  isAr:   boolean;
  onOpen: (task: Task) => void;
}

export function KanbanTaskCard({ task, isAr, onOpen }: Props) {
  const prio = PRIORITY_CONFIG[task.priority];

  return (
    <div
      draggable
      onClick={() => onOpen(task)}
      onDragStart={e => {
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className="bg-white dark:bg-gray-800 rounded-xl p-3.5 shadow-sm
                 border border-gray-100 dark:border-gray-700/60
                 cursor-grab active:cursor-grabbing active:opacity-50
                 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600
                 transition-all duration-150 select-none"
    >
      {/* Top: task number + priority badge */}
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] text-gray-400 font-mono">{task.taskNumber}</span>
        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${prio.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${prio.dot}`} />
          {isAr ? prio.ar : task.priority}
        </span>
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 leading-snug text-end">
        {task.title}
      </p>

      {/* Category */}
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3 text-end">
        {isAr ? task.categoryAr : task.categoryEn}
      </p>

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
