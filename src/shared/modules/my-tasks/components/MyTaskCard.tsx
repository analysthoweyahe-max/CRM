import { Calendar, MessageSquare, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import type { MyTask } from '../types/myTasks.types';
import { isEditableMyTask, isTaskOverdue, PRIORITY_BADGE } from '../utils/myTasks.utils';
import { ImportantLinksDisplay } from '@/shared/components/form/ImportantLinksDisplay';

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
  const isMine   = isEditableMyTask(task);

  function handleClick() {
    if (!isMine) {
      toast.info(
        isAr
          ? 'يمكنك فقط عرض ملخص مهمة الشريك من اللوحة'
          : 'You can only view a summary of a partner task on the board',
      );
      return;
    }
    onOpen(task);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={[
        'w-full text-start rounded-xl p-3.5 shadow-sm border transition-all duration-150',
        isMine
          ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700/60 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600'
          : 'bg-gray-50 dark:bg-gray-900/50 border-dashed border-gray-200 dark:border-gray-700 cursor-default opacity-90',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] text-gray-400 font-mono">#{task.taskNumber}</span>
        <div className="flex items-center gap-1.5">
          {!isMine && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full
                             bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              {isAr ? 'شريك' : 'Partner'}
            </span>
          )}
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${prioCls}`}>
            {task.priorityLabel}
          </span>
        </div>
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

      {!!task.importantLinks?.length && (
        <div className="mb-2">
          <ImportantLinksDisplay links={task.importantLinks} isAr={isAr} compact />
        </div>
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
