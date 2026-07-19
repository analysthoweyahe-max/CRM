import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { usePermission } from '@/shared/hooks/usePermission';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { extractApiError } from '@/shared/utils/error.utils';
import { taskResourceKey } from '@/shared/utils/resourceKey.utils';
import { KanbanBoard as SharedKanbanBoard } from '@/shared/components/kanban/KanbanBoard';
import { colorForKey } from '@/shared/components/kanban/kanbanColors';
import type { Task } from '../../tasks/types/task.types';
import { useInvalidateProjectTasks } from '../../tasks/store/taskStore';
import { pmTaskApi } from '../../tasks/api/task.api';
import { usePmTaskLookups } from '../hooks/usePmTaskLookups';
import { KanbanTaskCard } from './KanbanTaskCard';
import { KanbanTaskFilters } from './KanbanTaskFilters';
import { TaskModal } from '../../tasks/components/TaskModal';
import type { PmProjectPhase, PmProjectTeamMember } from '../types/project.types';
import {
  matchesTaskPeriod,
  type TaskPeriodFilter,
} from '../utils/kanbanTaskFilters.utils';

const UNASSIGNED = '__unassigned__';
const UNKNOWN_CREATOR = '__unknown_creator__';

/** Colors for the common, well-known statuses; anything else (an admin-added
 *  status not in this map) falls back to the deterministic hash color. */
const STATUS_COLOR: Record<string, string> = {
  pending:      '#9CA3AF',
  in_progress:  '#A0CD39',
  needs_review: '#F59E0B',
  completed:    '#10B981',
};

interface Props {
  projectId:   string;
  tasks:       Task[];
  isAr:        boolean;
  phases?:     PmProjectPhase[];
  teamMembers?: PmProjectTeamMember[];
}

export function KanbanBoard({ projectId, tasks, isAr, phases = [], teamMembers = [] }: Props) {
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [deleteTarget,   setDeleteTarget]   = useState<Task | null>(null);
  const [deleting,       setDeleting]       = useState(false);
  const [phaseFilter,    setPhaseFilter]    = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [creatorFilter,  setCreatorFilter]  = useState('');
  const [statusFilter,   setStatusFilter]   = useState('');
  const [periodFilter,   setPeriodFilter]   = useState<TaskPeriodFilter>('');
  const [dateFrom,       setDateFrom]       = useState('');
  const [dateTo,         setDateTo]         = useState('');
  const [viewMode,       setViewMode]       = useState<'status' | 'phase'>('status');
  const invalidateTasks = useInvalidateProjectTasks(projectId);
  const { statuses: statusLookup } = usePmTaskLookups();
  const canEditTasks = usePermission('edit-pm-tasks');

  const phaseItems: ComboboxItem[] = useMemo(() => {
    const fromProject = phases.map(p => ({ id: String(p.id), label: p.name }));
    const fromTasks = tasks
      .filter(t => t.phaseId != null)
      .map(t => ({ id: String(t.phaseId), label: t.phaseName || String(t.phaseId) }));
    const map = new Map<string, ComboboxItem>();
    for (const item of [...fromProject, ...fromTasks]) {
      if (item.id) map.set(item.id, item);
    }
    return [
      { id: '', label: isAr ? 'كل المراحل' : 'All phases' },
      ...Array.from(map.values()),
    ];
  }, [phases, tasks, isAr]);

  const assigneeItems: ComboboxItem[] = useMemo(() => {
    const fromTeam = teamMembers.map(m => ({ id: m.id, label: m.name }));
    const fromTasks = tasks
      .filter(t => t.assigneeId)
      .map(t => ({ id: t.assigneeId!, label: t.assigneeName || t.assigneeId! }));
    const map = new Map<string, ComboboxItem>();
    for (const item of [...fromTeam, ...fromTasks]) {
      if (item.id) map.set(item.id, item);
    }
    const items = [
      { id: '', label: isAr ? 'كل المسؤولين' : 'All assignees' },
      ...Array.from(map.values()),
    ];
    if (tasks.some(t => !t.assigneeId)) {
      items.push({ id: UNASSIGNED, label: isAr ? 'بدون مسؤول' : 'Unassigned' });
    }
    return items;
  }, [teamMembers, tasks, isAr]);

  const creatorItems: ComboboxItem[] = useMemo(() => {
    const map = new Map<string, ComboboxItem>();
    for (const t of tasks) {
      if (t.createdById) {
        map.set(t.createdById, {
          id: t.createdById,
          label: t.createdByName || t.createdById,
        });
      }
    }
    const items = [
      { id: '', label: isAr ? 'كل المنشئين' : 'All creators' },
      ...Array.from(map.values()),
    ];
    if (tasks.some(t => !t.createdById)) {
      items.push({ id: UNKNOWN_CREATOR, label: isAr ? 'غير معروف' : 'Unknown' });
    }
    return items;
  }, [tasks, isAr]);

  const statusItems: ComboboxItem[] = useMemo(() => {
    const keys = statusLookup.length > 0
      ? statusLookup.map(s => s.value)
      : ['pending', 'in_progress', 'needs_review', 'completed'];
    return [
      { id: '', label: isAr ? 'كل الحالات' : 'All statuses' },
      ...keys.map(key => {
        const lookup = statusLookup.find(s => s.value === key);
        const label = lookup
          ? (isAr ? (lookup.labelAr || lookup.label) : lookup.label)
          : key;
        return { id: key, label };
      }),
    ];
  }, [statusLookup, isAr]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (phaseFilter && String(t.phaseId ?? '') !== phaseFilter) return false;
      if (assigneeFilter === UNASSIGNED) return !t.assigneeId;
      if (assigneeFilter && t.assigneeId !== assigneeFilter) return false;
      if (creatorFilter === UNKNOWN_CREATOR) return !t.createdById;
      if (creatorFilter && t.createdById !== creatorFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (!matchesTaskPeriod(t.createdAt, periodFilter, dateFrom, dateTo)) return false;
      return true;
    });
  }, [
    tasks, phaseFilter, assigneeFilter, creatorFilter, statusFilter,
    periodFilter, dateFrom, dateTo,
  ]);

  const hasActiveFilters = !!phaseFilter || !!assigneeFilter || !!creatorFilter
    || !!statusFilter || !!periodFilter;
  const selectedTask = selectedTaskId
    ? tasks.find(t => t.id === selectedTaskId) ?? null
    : null;

  /* ── Status columns — driven by the admin-configured lookup, falling
     back to the 4 well-known keys while the lookup is still loading ──── */
  const statusColumns = useMemo(() => {
    const keys = statusLookup.length > 0
      ? statusLookup.map(s => s.value)
      : ['pending', 'in_progress', 'needs_review', 'completed'];
    const visibleKeys = statusFilter ? keys.filter(key => key === statusFilter) : keys;
    // If filter points at a key missing from the lookup, still show that column.
    const columnKeys = visibleKeys.length > 0
      ? visibleKeys
      : (statusFilter ? [statusFilter] : keys);
    return columnKeys.map(key => {
      const lookup = statusLookup.find(s => s.value === key);
      const label = lookup ? (isAr ? (lookup.labelAr || lookup.label) : lookup.label) : key;
      return {
        key,
        label,
        color: STATUS_COLOR[key] ?? colorForKey(key),
        items: filteredTasks.filter(t => t.status === key),
      };
    });
  }, [statusLookup, filteredTasks, isAr, statusFilter]);

  /* ── Phase columns — from the project's phase list plus any task-only
     phase not (yet) represented there. A selected phase filter keeps only
     that column so the board is the selected phase alone. ─────────────── */
  const phaseColumns = useMemo(() => {
    const map = new Map<string, { key: string; label: string; items: Task[] }>();
    for (const p of phases) {
      const key = String(p.id);
      if (phaseFilter && key !== phaseFilter) continue;
      map.set(key, { key, label: p.name, items: [] });
    }
    for (const t of filteredTasks) {
      const key = t.phaseId != null ? String(t.phaseId) : '__none__';
      if (phaseFilter && key !== phaseFilter) continue;
      if (!map.has(key)) {
        map.set(key, {
          key,
          label: t.phaseName || (isAr ? 'بدون مرحلة' : 'No phase'),
          items: [],
        });
      }
      map.get(key)!.items.push(t);
    }
    // Selected phase with no tasks yet — still show its empty column.
    if (phaseFilter && !map.has(phaseFilter)) {
      const fromList = phases.find(p => String(p.id) === phaseFilter);
      const fromItems = phaseItems.find(p => p.id === phaseFilter);
      map.set(phaseFilter, {
        key: phaseFilter,
        label: fromList?.name || fromItems?.label || phaseFilter,
        items: [],
      });
    }
    return Array.from(map.values()).map(col => ({
      ...col,
      color: colorForKey(col.key),
    }));
  }, [phases, filteredTasks, isAr, phaseFilter, phaseItems]);

  async function handleStatusDrop(taskId: string, toStatus: string) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === toStatus) return;
    try {
      // Not the dedicated PATCH .../status sub-route — per the backend's own
      // Postman collection, that route is only ever exercised with an
      // employee token; a manager (admin token) instead goes through the
      // general task-update endpoint with `status` in the body.
      await pmTaskApi.update(projectId, taskResourceKey(task), { status: toStatus });
      invalidateTasks();
      queryClient.invalidateQueries({ queryKey: ['pm-dashboard'] });
      toast.success(isAr ? 'تم تحديث حالة المهمة' : 'Task status updated');
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر تحديث حالة المهمة' : 'Failed to update task status'));
    }
  }

  async function handlePhaseDrop(taskId: string, toPhaseKey: string) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || String(task.phaseId ?? '') === toPhaseKey) return;
    const phaseId = Number(toPhaseKey);
    if (!Number.isFinite(phaseId)) return;
    try {
      await pmTaskApi.update(projectId, taskResourceKey(task), { phaseId });
      invalidateTasks();
      toast.success(isAr ? 'تم تحديث مرحلة المهمة' : 'Task phase updated');
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر تحديث مرحلة المهمة' : 'Failed to update task phase'));
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await pmTaskApi.remove(projectId, taskResourceKey(deleteTarget));
      invalidateTasks();
      toast.success(isAr ? 'تم حذف المهمة' : 'Task deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر حذف المهمة' : 'Failed to delete task'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1 px-1">
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
        phase={phaseFilter}
        assignee={assigneeFilter}
        creator={creatorFilter}
        status={statusFilter}
        period={periodFilter}
        dateFrom={dateFrom}
        dateTo={dateTo}
        phaseItems={phaseItems}
        assigneeItems={assigneeItems}
        creatorItems={creatorItems}
        statusItems={statusItems}
        onPhase={setPhaseFilter}
        onAssignee={setAssigneeFilter}
        onCreator={setCreatorFilter}
        onStatus={setStatusFilter}
        onPeriod={(value) => {
          setPeriodFilter(value);
          if (value !== 'custom') {
            setDateFrom('');
            setDateTo('');
          }
        }}
        onDateFrom={setDateFrom}
        onDateTo={setDateTo}
        onClear={() => {
          setPhaseFilter('');
          setAssigneeFilter('');
          setCreatorFilter('');
          setStatusFilter('');
          setPeriodFilter('');
          setDateFrom('');
          setDateTo('');
        }}
        hasActive={hasActiveFilters}
        resultCount={filteredTasks.length}
        totalCount={tasks.length}
      />

      <SharedKanbanBoard
        columns={viewMode === 'status' ? statusColumns : phaseColumns}
        isAr={isAr}
        getId={(task: Task) => task.id}
        renderCard={(task: Task) => (
          <KanbanTaskCard
            task={task}
            isAr={isAr}
            onOpen={t => setSelectedTaskId(t.id)}
            onDelete={canEditTasks ? t => setDeleteTarget(t) : undefined}
          />
        )}
        onDrop={canEditTasks ? (viewMode === 'status' ? handleStatusDrop : handlePhaseDrop) : () => {}}
        draggable={canEditTasks}
      />

      <TaskModal
        key={selectedTask?.id ?? ''}
        task={selectedTask}
        onClose={() => setSelectedTaskId(null)}
        projectId={projectId}
        isAr={isAr}
      />

      <Modal
        open={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title={isAr ? 'حذف المهمة' : 'Delete Task'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
              {isAr ? 'حذف' : 'Delete'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 text-end leading-relaxed">
          {isAr
            ? `هل أنت متأكد من حذف المهمة "${deleteTarget?.title}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : `Are you sure you want to delete the task "${deleteTarget?.title}"? This action cannot be undone.`}
        </p>
      </Modal>
    </>
  );
}
