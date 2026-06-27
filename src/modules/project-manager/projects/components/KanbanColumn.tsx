import { useState } from 'react';
import type { Task, TaskStatus } from '../../tasks/types/task.types';
import { KanbanTaskCard } from './KanbanTaskCard';

const COLUMN_CONFIG: Record<TaskStatus, {
  labelAr: string; labelEn: string;
  dot:     string; headerCls: string;
}> = {
  pending:    { labelAr: 'قيد الانتظار',  labelEn: 'Pending',     dot: 'bg-gray-400',    headerCls: 'text-gray-600 dark:text-gray-300'          },
  inProgress: { labelAr: 'قيد التنفيذ',   labelEn: 'In Progress', dot: 'bg-[#A0CD39]',   headerCls: 'text-[#709028] dark:text-[#A0CD39]'        },
  review:     { labelAr: 'بحاجة لمراجعة', labelEn: 'In Review',   dot: 'bg-amber-500',   headerCls: 'text-amber-600 dark:text-amber-400'        },
  completed:  { labelAr: 'مكتمل',         labelEn: 'Completed',   dot: 'bg-emerald-500', headerCls: 'text-emerald-600 dark:text-emerald-400'    },
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
    <div className="flex flex-col flex-1 min-w-[250px] max-w-[320px]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
        <span className={`text-sm font-semibold ${cfg.headerCls}`}>
          {isAr ? cfg.labelAr : cfg.labelEn}
        </span>
        <span className="ms-auto min-w-[22px] h-[22px] px-1 rounded-full
                         bg-gray-100 dark:bg-gray-700
                         text-gray-500 dark:text-gray-400 text-[11px] font-bold
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
          'flex-1 min-h-[480px] rounded-xl p-2.5 space-y-3 transition-all duration-150',
          isDragOver
            ? 'bg-[#D8EBAE]/40 dark:bg-[#A0CD39]/10 ring-2 ring-[#A0CD39] ring-dashed'
            : 'bg-gray-50/70 dark:bg-gray-800/40',
        ].join(' ')}
      >
        {tasks.map(task => (
          <KanbanTaskCard key={task.id} task={task} isAr={isAr} onOpen={onOpen} />
        ))}

        {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center py-16">
            <p className="text-xs text-gray-300 dark:text-gray-600 select-none">
              {isAr ? 'لا توجد مهام' : 'No tasks'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
