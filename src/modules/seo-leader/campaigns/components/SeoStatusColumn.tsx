import { useState } from 'react';
import { KanbanTaskCard } from '@/modules/project-manager/projects/components/KanbanTaskCard';
import type { Task } from '@/modules/project-manager/tasks/types/task.types';
import type { ApiSeoTaskStatus } from '@/modules/admin/seo-task-statuses/types/seoTaskStatus.types';

interface Props {
  status: ApiSeoTaskStatus;
  tasks:  Task[];
  isAr:   boolean;
  onDrop: (taskId: string, toStatusKey: string) => void;
  onOpen: (task: Task) => void;
}

/** Same drag-and-drop mechanics as the PM KanbanColumn, but the set of
 *  columns/keys is whatever the admin configured in "SEO Task Statuses"
 *  instead of a hardcoded 4-value enum — so every column here is always a
 *  status key the backend actually recognizes. */
export function SeoStatusColumn({ status, tasks, isAr, onDrop, onOpen }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div
      className="flex flex-col flex-1 min-w-[270px] max-w-[320px] shrink-0
                 rounded-2xl border border-gray-200 dark:border-gray-700
                 bg-white dark:bg-gray-800/40 shadow-sm overflow-hidden border-t-4"
      style={{ borderTopColor: status.color }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3
                      border-b border-gray-200 dark:border-gray-700/70
                      bg-white dark:bg-gray-800/70">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: status.color }} />
        <span className="text-sm font-bold text-gray-800 dark:text-gray-100">
          {isAr ? (status.labelAr || status.label) : (status.labelEn || status.label)}
        </span>
        <span className="ms-auto min-w-[24px] h-6 px-1.5 rounded-full
                         bg-gray-100 dark:bg-gray-700
                         text-gray-600 dark:text-gray-300 text-xs font-bold
                         flex items-center justify-center">
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
        }}
        onDrop={e => {
          e.preventDefault();
          const taskId = e.dataTransfer.getData('taskId');
          if (taskId) onDrop(taskId, status.key);
          setIsDragOver(false);
        }}
        className={[
          'flex-1 min-h-[480px] p-3 space-y-3 transition-all duration-150',
          isDragOver
            ? 'ring-2 ring-inset ring-[#A0CD39] ring-dashed bg-[#D8EBAE]/30 dark:bg-[#A0CD39]/10'
            : 'bg-gray-50/70 dark:bg-gray-900/20',
        ].join(' ')}
      >
        {tasks.map(task => (
          <KanbanTaskCard key={task.id} task={task} isAr={isAr} onOpen={onOpen} />
        ))}

        {tasks.length === 0 && (
          <div className="h-full min-h-[200px] flex items-center justify-center py-16
                          rounded-xl border border-dashed border-gray-200 dark:border-gray-600/60">
            <p className="text-sm text-gray-400 dark:text-gray-500 select-none">
              {isAr ? 'لا توجد مهام' : 'No tasks'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
