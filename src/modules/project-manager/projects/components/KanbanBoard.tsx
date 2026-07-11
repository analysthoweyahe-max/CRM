import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import type { ComboboxItem } from '@/shared/components/form/Combobox';
import { extractApiError } from '@/shared/utils/error.utils';
import { taskResourceKey } from '@/shared/utils/resourceKey.utils';
import type { Task, TaskStatus } from '../../tasks/types/task.types';
import { useInvalidateProjectTasks } from '../../tasks/store/taskStore';
import { pmTaskApi } from '../../tasks/api/task.api';
import { KanbanColumn } from './KanbanColumn';
import { KanbanTaskFilters } from './KanbanTaskFilters';
import { TaskModal } from '../../tasks/components/TaskModal';
import type { PmProjectPhase, PmProjectTeamMember } from '../types/project.types';

const COLUMNS: TaskStatus[] = ['pending', 'in_progress', 'needs_review', 'completed'];
const UNASSIGNED = '__unassigned__';

interface Props {
  projectId:   string;
  tasks:       Task[];
  isAr:        boolean;
  phases?:     PmProjectPhase[];
  teamMembers?: PmProjectTeamMember[];
}

export function KanbanBoard({ projectId, tasks, isAr, phases = [], teamMembers = [] }: Props) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [deleteTarget,   setDeleteTarget]   = useState<Task | null>(null);
  const [deleting,       setDeleting]       = useState(false);
  const [phaseFilter,    setPhaseFilter]    = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const invalidateTasks = useInvalidateProjectTasks(projectId);

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
      { id: '', label: isAr ? 'كل الأعضاء' : 'All members' },
      ...Array.from(map.values()),
    ];
    if (tasks.some(t => !t.assigneeId)) {
      items.push({ id: UNASSIGNED, label: isAr ? 'بدون مسؤول' : 'Unassigned' });
    }
    return items;
  }, [teamMembers, tasks, isAr]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (phaseFilter && String(t.phaseId ?? '') !== phaseFilter) return false;
      if (assigneeFilter === UNASSIGNED) return !t.assigneeId;
      if (assigneeFilter && t.assigneeId !== assigneeFilter) return false;
      return true;
    });
  }, [tasks, phaseFilter, assigneeFilter]);

  const hasActiveFilters = !!phaseFilter || !!assigneeFilter;
  const selectedTask = selectedTaskId
    ? tasks.find(t => t.id === selectedTaskId) ?? null
    : null;

  async function handleDrop(taskId: string, toStatus: TaskStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === toStatus) return;
    try {
      await pmTaskApi.updateStatus(projectId, taskResourceKey(task), toStatus);
      invalidateTasks();
      toast.success(isAr ? 'تم تحديث حالة المهمة' : 'Task status updated');
    } catch (err) {
      toast.error(extractApiError(err) || (isAr ? 'تعذر تحديث حالة المهمة' : 'Failed to update task status'));
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
      <KanbanTaskFilters
        isAr={isAr}
        phase={phaseFilter}
        assignee={assigneeFilter}
        phaseItems={phaseItems}
        assigneeItems={assigneeItems}
        onPhase={setPhaseFilter}
        onAssignee={setAssigneeFilter}
        onClear={() => { setPhaseFilter(''); setAssigneeFilter(''); }}
        hasActive={hasActiveFilters}
        resultCount={filteredTasks.length}
        totalCount={tasks.length}
      />

      <div className="flex gap-5 overflow-x-auto pb-4 px-1">
        {COLUMNS.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={filteredTasks.filter(t => t.status === status)}
            isAr={isAr}
            onDrop={handleDrop}
            onOpen={task => setSelectedTaskId(task.id)}
            onDelete={task => setDeleteTarget(task)}
          />
        ))}
      </div>
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
