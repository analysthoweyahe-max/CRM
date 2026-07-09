import { useState } from 'react';
import { toast } from 'sonner';
import { Modal }  from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import type { Task, TaskStatus } from '../../tasks/types/task.types';
import { useInvalidateProjectTasks } from '../../tasks/store/taskStore';
import { pmTaskApi } from '../../tasks/api/task.api';
import { KanbanColumn } from './KanbanColumn';
import { TaskModal } from '../../tasks/components/TaskModal';

const COLUMNS: TaskStatus[] = ['pending', 'in_progress', 'needs_review', 'completed'];

interface Props {
  projectId: string;
  tasks:     Task[];
  isAr:      boolean;
}

export function KanbanBoard({ projectId, tasks, isAr }: Props) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [deleteTarget,   setDeleteTarget]   = useState<Task | null>(null);
  const [deleting,       setDeleting]       = useState(false);
  const invalidateTasks = useInvalidateProjectTasks(projectId);
  // Derived (not stored) so it always reflects the latest data after an edit —
  // storing the Task object itself would freeze the modal on a stale snapshot.
  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) ?? null : null;

  async function handleDrop(taskId: string, toStatus: TaskStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === toStatus) return;
    try {
      await pmTaskApi.updateStatus(projectId, taskId, toStatus);
      invalidateTasks();
      toast.success(isAr ? 'تم تحديث حالة المهمة' : 'Task status updated');
    } catch {
      toast.error(isAr ? 'تعذر تحديث حالة المهمة' : 'Failed to update task status');
    }
  }

  async function confirmDelete() {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await pmTaskApi.remove(projectId, deleteTarget.id);
      invalidateTasks();
      toast.success(isAr ? 'تم حذف المهمة' : 'Task deleted');
      setDeleteTarget(null);
    } catch {
      toast.error(isAr ? 'تعذر حذف المهمة' : 'Failed to delete task');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex gap-5 overflow-x-auto pb-4 px-1">
        {COLUMNS.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter(t => t.status === status)}
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

      {/* Delete confirmation */}
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
