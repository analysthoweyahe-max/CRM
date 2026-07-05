import { useState } from 'react';
import { toast } from 'sonner';
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

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(status => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks.filter(t => t.status === status)}
            isAr={isAr}
            onDrop={handleDrop}
            onOpen={task => setSelectedTaskId(task.id)}
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
    </>
  );
}
