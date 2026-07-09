import { Calendar, MessageSquare, Paperclip } from 'lucide-react';
import type { MyTask } from '../types/myTasks.types';
import { isTaskOverdue, PRIORITY_BADGE } from '../utils/myTasks.utils';

interface Props {
  task:            MyTask;
  isAr:            boolean;
  showProjectName: boolean;
  onOpen:          (task: MyTask) => void;
}

export function MyTaskCard({ task, isAr, showProjectName, onOpen }: Props) {
  const overdue  = isTaskOverdue(task);
  const prioCls  = PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.normal;
  const assignee = task.assignee;

  return (
    <button
      type="button"
      onClick={() => onOpen(task)}
      className="w-full text-start bg-white dark:bg-gray-800 rounded-xl p-3.5 shadow-sm
                 border border-gray-100 dark:border-gray-700/60
                 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600
                 transition-all duration-150"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] text-gray-400 font-mono">#{task.taskNumber}</span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${prioCls}`}>
          {task.priorityLabel}
        </span>
      </div>

      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-1 leading-snug">
        {task.title}
      </p>

      {showProjectName && task.project && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate">
          {task.project.name}
        </p>
      )}

      {task.phase && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 truncate">
          {task.phase.name}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          {(task.attachmentsCount ?? 0) > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <Paperclip size={12} />
              {task.attachmentsCount}
            </span>
          )}
          {(task.commentsCount ?? 0) > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <MessageSquare size={12} />
              {task.commentsCount}
            </span>
          )}
        </div>

        {assignee && (
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[80px]">
              {assignee.name}
            </span>
            <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center
                            text-white text-xs font-bold shrink-0">
              {assignee.avatarInitial}
            </div>
          </div>
        )}
      </div>

      {task.dueDate && (
        <div className={`flex items-center gap-1 mt-2 text-xs ${overdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
          <Calendar size={12} />
          <span>
            {isAr ? (overdue ? 'متأخرة: ' : 'التسليم: ') : (overdue ? 'Overdue: ' : 'Due: ')}
            {task.dueDate}
          </span>
        </div>
      )}
    </button>
  );
}
