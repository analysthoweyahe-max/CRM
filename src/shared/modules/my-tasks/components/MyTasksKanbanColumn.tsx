import { useState } from 'react';
import type { MyTask, MyTaskColumn } from '../types/myTasks.types';
import { COLUMN_ACCENT, DEFAULT_COLUMN_ACCENT } from '../utils/myTasks.utils';
import { MyTaskCard } from './MyTaskCard';

interface Props {
  column:          MyTaskColumn;
  isAr:            boolean;
  showProjectName: boolean;
  canDrag:         boolean;
  onOpen:          (task: MyTask) => void;
  onDrop?:         (taskId: number, toStatus: string) => void;
}

export function MyTasksKanbanColumn({
  column,
  isAr,
  showProjectName,
  canDrag,
  onOpen,
  onDrop,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const cfg = COLUMN_ACCENT[column.status] ?? DEFAULT_COLUMN_ACCENT;

  return (
    <div
      className={[
        'flex flex-col flex-1 min-w-[270px] max-w-[320px] shrink-0',
        'rounded-2xl border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-800/40 shadow-sm overflow-hidden border-t-4',
        cfg.accent,
      ].join(' ')}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-800/70">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
          {column.statusLabel}
        </span>
        <span className="ms-auto min-w-[24px] h-6 px-1.5 rounded-full bg-gray-100 dark:bg-gray-700
                         text-gray-600 dark:text-gray-300 text-xs font-bold flex items-center justify-center">
          {column.tasks.length}
        </span>
      </div>

      <div
        onDragOver={canDrag ? (e) => { e.preventDefault(); setIsDragOver(true); } : undefined}
        onDragLeave={canDrag ? (e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
        } : undefined}
        onDrop={canDrag ? (e) => {
          e.preventDefault();
          const taskId = Number(e.dataTransfer.getData('taskId'));
          if (taskId && onDrop) onDrop(taskId, column.status);
          setIsDragOver(false);
        } : undefined}
        className={[
          'flex-1 min-h-[480px] p-3 space-y-3 transition-all duration-150',
          cfg.surface,
          isDragOver ? 'ring-2 ring-inset ring-[#A0CD39] ring-dashed' : '',
        ].join(' ')}
      >
        {column.tasks.map((task) => (
          <div
            key={task.id}
            draggable={canDrag}
            onDragStart={canDrag ? (e) => {
              e.dataTransfer.setData('taskId', String(task.id));
              e.dataTransfer.effectAllowed = 'move';
            } : undefined}
          >
            <MyTaskCard
              task={task}
              isAr={isAr}
              showProjectName={showProjectName}
              onOpen={onOpen}
            />
          </div>
        ))}

        {column.tasks.length === 0 && (
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
