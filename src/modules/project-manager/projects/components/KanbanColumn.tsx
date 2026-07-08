import { useState } from 'react';
import type { Task, TaskStatus } from '../../tasks/types/task.types';
import { KanbanTaskCard } from './KanbanTaskCard';

const COLUMN_CONFIG: Record<TaskStatus, {
  labelAr: string; labelEn: string;
  dot:     string; headerCls: string;
  accent:  string; surface: string;
}> = {
  pending:      {
    labelAr: 'قيد الانتظار',  labelEn: 'Pending',
    dot: 'bg-gray-400',    headerCls: 'text-gray-700 dark:text-gray-200',
    accent: 'border-t-gray-400',    surface: 'bg-gray-50/90 dark:bg-gray-900/40',
  },
  in_progress:  {
    labelAr: 'قيد التنفيذ',   labelEn: 'In Progress',
    dot: 'bg-[#A0CD39]',   headerCls: 'text-[#709028] dark:text-[#A0CD39]',
    accent: 'border-t-[#A0CD39]',   surface: 'bg-[#f7fbea]/80 dark:bg-[#A0CD39]/5',
  },
  needs_review: {
    labelAr: 'بحاجة للمراجعة', labelEn: 'Needs Review',
    dot: 'bg-amber-500',   headerCls: 'text-amber-700 dark:text-amber-400',
    accent: 'border-t-amber-500',   surface: 'bg-amber-50/70 dark:bg-amber-900/10',
  },
  completed:    {
    labelAr: 'مكتمل',         labelEn: 'Completed',
    dot: 'bg-emerald-500', headerCls: 'text-emerald-700 dark:text-emerald-400',
    accent: 'border-t-emerald-500', surface: 'bg-emerald-50/60 dark:bg-emerald-900/10',
  },
};

interface Props {
  status: TaskStatus;
  tasks:  Task[];
  isAr:   boolean;
  onDrop: (taskId: string, toStatus: TaskStatus) => void;
  onOpen: (task: Task) => void;
}

export function KanbanColumn({ status, tasks, isAr, onDrop, onOpen }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const cfg = COLUMN_CONFIG[status];

  return (
    <div
      className={[
        'flex flex-col flex-1 min-w-[270px] max-w-[320px] shrink-0',
        'rounded-2xl border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-800/40 shadow-sm overflow-hidden',
        'border-t-4',
        cfg.accent,
      ].join(' ')}
    >
      {/* Header */}
      <div
        className={[
          'flex items-center gap-2 px-4 py-3',
          'border-b border-gray-200 dark:border-gray-700/70',
          'bg-white dark:bg-gray-800/70',
        ].join(' ')}
      >
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
        <span className={`text-sm font-bold ${cfg.headerCls}`}>
          {isAr ? cfg.labelAr : cfg.labelEn}
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
          if (taskId) onDrop(taskId, status);
          setIsDragOver(false);
        }}
        className={[
          'flex-1 min-h-[480px] p-3 space-y-3 transition-all duration-150',
          cfg.surface,
          isDragOver
            ? 'ring-2 ring-inset ring-[#A0CD39] ring-dashed bg-[#D8EBAE]/30 dark:bg-[#A0CD39]/10'
            : '',
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
