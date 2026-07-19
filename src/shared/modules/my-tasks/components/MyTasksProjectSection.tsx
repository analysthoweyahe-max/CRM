import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { KanbanBoard } from '@/shared/components/kanban/KanbanBoard';
import { colorForKey } from '@/shared/components/kanban/kanbanColors';
import { MyTaskCard } from './MyTaskCard';
import type { GroupedTasksData, MyTask, TaskPhase } from '../types/myTasks.types';
import { isEditableMyTask } from '../utils/myTasks.utils';

const STATUS_COLOR: Record<string, string> = {
  pending:      '#9CA3AF',
  in_progress:  '#A0CD39',
  in_review:    '#F59E0B',
  needs_review: '#F59E0B',
  blocked:      '#EF4444',
  completed:    '#10B981',
};

interface Props {
  project:   { id: number | string; name: string };
  data:      GroupedTasksData;
  isAr:      boolean;
  canDrag:   boolean;
  onOpen:    (task: MyTask) => void;
  onStatusChange?: (task: MyTask, toStatus: string) => Promise<void>;
  onPhaseChange?:  (task: MyTask, toPhase: TaskPhase) => Promise<void>;
}

/** One project's board within the cross-project "My Tasks" page — same
 *  Status/Phase toggle + shared Kanban board as the PM/SEO project pages. */
export function MyTasksProjectSection({ project, data, isAr, canDrag, onOpen, onStatusChange, onPhaseChange }: Props) {
  const [viewMode, setViewMode] = useState<'status' | 'phase'>('status');
  const allTasks = useMemo(() => data.columns.flatMap(c => c.tasks), [data.columns]);

  const phaseColumns = useMemo(() => {
    const map = new Map<string, { key: string; label: string; phase?: MyTask['phase']; items: MyTask[] }>();
    for (const t of allTasks) {
      const key = t.phase ? String(t.phase.id) : '__none__';
      if (!map.has(key)) {
        map.set(key, { key, label: t.phase?.name ?? (isAr ? 'بدون مرحلة' : 'No phase'), phase: t.phase, items: [] });
      }
      map.get(key)!.items.push(t);
    }
    return Array.from(map.values()).map(col => ({ ...col, color: colorForKey(col.key) }));
  }, [allTasks, isAr]);

  async function handleStatusDrop(id: string, toStatus: string) {
    const task = allTasks.find(t => String(t.id) === id);
    if (!task || !onStatusChange || task.status === toStatus) return;
    if (!isEditableMyTask(task)) {
      toast.info(isAr ? 'لا يمكن تحديث مهام الشركاء' : 'Partner tasks cannot be updated');
      return;
    }
    await onStatusChange(task, toStatus);
  }

  async function handlePhaseDrop(id: string, toPhaseKey: string) {
    const task = allTasks.find(t => String(t.id) === id);
    const column = phaseColumns.find(c => c.key === toPhaseKey);
    if (!task || !onPhaseChange || !column?.phase || task.phase?.id === column.phase.id) return;
    if (!isEditableMyTask(task)) {
      toast.info(isAr ? 'لا يمكن تحديث مهام الشركاء' : 'Partner tasks cannot be updated');
      return;
    }
    await onPhaseChange(task, column.phase);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
        <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">{project.name}</h3>
        <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-700 p-0.5 bg-gray-50 dark:bg-gray-900/40">
          {(['status', 'phase'] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              className={[
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                viewMode === mode
                  ? 'bg-white dark:bg-gray-800 text-[#709028] dark:text-[#A0CD39] shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
              ].join(' ')}
            >
              {mode === 'status' ? (isAr ? 'الحالة' : 'Status') : (isAr ? 'المرحلة' : 'Phase')}
            </button>
          ))}
        </div>
      </div>

      <KanbanBoard
        columns={
          viewMode === 'status'
            ? data.columns.map(col => ({
                key:   col.status,
                label: col.statusLabel,
                color: STATUS_COLOR[col.status] ?? colorForKey(col.status),
                items: col.tasks,
              }))
            : phaseColumns
        }
        isAr={isAr}
        draggable={canDrag && !!(viewMode === 'status' ? onStatusChange : onPhaseChange)}
        isItemDraggable={(task: MyTask) => isEditableMyTask(task)}
        getId={(task: MyTask) => String(task.id)}
        renderCard={(task: MyTask) => (
          <MyTaskCard task={task} isAr={isAr} showProjectName={false} onOpen={onOpen} />
        )}
        onDrop={viewMode === 'status' ? handleStatusDrop : handlePhaseDrop}
      />
    </div>
  );
}
