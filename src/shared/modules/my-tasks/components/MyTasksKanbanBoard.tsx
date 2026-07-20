import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import type { GroupedTasksData, MyTask } from '../types/myTasks.types';
import { KanbanBoard } from '@/shared/components/kanban/KanbanBoard';
import { colorForKey } from '@/shared/components/kanban/kanbanColors';
import { translateProjectLookup } from '@/shared/utils/projectLookup.i18n';
import { KanbanTaskFilters } from '@/modules/project-manager/projects/components/KanbanTaskFilters';
import { isEditableMyTask } from '../utils/myTasks.utils';
import { useMyTasksBoardFilters } from '../hooks/useMyTasksBoardFilters';
import { MyTaskCard } from './MyTaskCard';

const STATUS_COLOR: Record<string, string> = {
  pending:      '#9CA3AF',
  in_progress:  '#A0CD39',
  in_review:    '#F59E0B',
  needs_review: '#F59E0B',
  blocked:      '#EF4444',
  completed:    '#10B981',
};

interface Props {
  data:            GroupedTasksData;
  isAr:            boolean;
  showProjectName: boolean;
  canDrag:         boolean;
  onOpen:          (task: MyTask) => void;
  onStatusChange?: (task: MyTask, toStatus: string) => Promise<void>;
}

export function MyTasksKanbanBoard({
  data,
  isAr,
  showProjectName,
  canDrag,
  onOpen,
  onStatusChange,
}: Props) {
  const allTasks = useMemo(() => data.columns.flatMap((c) => c.tasks), [data.columns]);
  const filters = useMyTasksBoardFilters(allTasks, isAr);
  const filteredData = useMemo(
    () => filters.filterGroupedData(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- filterGroupedData closes over filter state
    [data, filters.filteredTasks, filters.statusFilter],
  );
  const [viewMode, setViewMode] = useState<'status' | 'phase'>('status');

  const phaseColumns = useMemo(() => {
    const map = new Map<string, { key: string; label: string; items: MyTask[] }>();
    for (const t of filters.filteredTasks) {
      const key = t.phase ? String(t.phase.id) : '__none__';
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: t.phase?.name ?? (isAr ? 'بدون مرحلة' : 'No phase'),
          items: [],
        });
      }
      map.get(key)!.items.push(t);
    }
    return Array.from(map.values()).map(col => ({ ...col, color: colorForKey(col.key) }));
  }, [filters.filteredTasks, isAr]);

  async function handleDrop(id: string, toStatus: string) {
    const taskId = Number(id);
    const task = allTasks.find((t) => t.id === taskId);
    if (!task || task.status === toStatus || !onStatusChange) return;
    if (!isEditableMyTask(task)) {
      toast.info(isAr ? 'لا يمكن تحديث مهام الشركاء' : 'Partner tasks cannot be updated');
      return;
    }
    if (!task.project?.id) {
      toast.error(isAr ? 'لا يمكن تحديث المهمة بدون مشروع' : 'Cannot update task without a project');
      return;
    }
    try {
      await onStatusChange(task, toStatus);
      toast.success(isAr ? 'تم تحديث حالة المهمة' : 'Task status updated');
    } catch {
      toast.error(isAr ? 'تعذر تحديث حالة المهمة' : 'Failed to update task status');
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 px-1">
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

      <KanbanTaskFilters
        isAr={isAr}
        phase=""
        assignee={filters.assigneeFilter}
        creator={filters.creatorFilter}
        status={filters.statusFilter}
        period={filters.periodFilter}
        dateFrom={filters.dateFrom}
        dateTo={filters.dateTo}
        phaseItems={[{ id: '', label: isAr ? 'كل المراحل' : 'All phases' }]}
        assigneeItems={filters.assigneeItems}
        creatorItems={filters.creatorItems}
        statusItems={filters.statusItems}
        onPhase={() => {}}
        onAssignee={filters.setAssigneeFilter}
        onCreator={filters.setCreatorFilter}
        onStatus={filters.setStatusFilter}
        onPeriod={filters.setPeriod}
        onDateFrom={filters.setDateFrom}
        onDateTo={filters.setDateTo}
        onClear={filters.clearFilters}
        hasActive={filters.hasActiveFilters}
        resultCount={filters.filteredTasks.length}
        totalCount={allTasks.length}
        hidePhase
      />

      <KanbanBoard
        columns={
          viewMode === 'status'
            ? filteredData.columns.map((column) => ({
                key:   column.status,
                label: translateProjectLookup(column.status, column.statusLabel, isAr),
                color: STATUS_COLOR[column.status] ?? colorForKey(column.status),
                items: column.tasks,
              }))
            : phaseColumns
        }
        isAr={isAr}
        draggable={canDrag && !!onStatusChange && viewMode === 'status'}
        isItemDraggable={(task: MyTask) => isEditableMyTask(task)}
        getId={(task: MyTask) => String(task.id)}
        renderCard={(task: MyTask) => (
          <MyTaskCard task={task} isAr={isAr} showProjectName={showProjectName} onOpen={onOpen} />
        )}
        onDrop={handleDrop}
      />
    </div>
  );
}
