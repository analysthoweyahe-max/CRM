import { toast } from 'sonner';
import type { GroupedTasksData, MyTask } from '../types/myTasks.types';
import { KanbanBoard } from '@/shared/components/kanban/KanbanBoard';
import { colorForKey } from '@/shared/components/kanban/kanbanColors';
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
  const allTasks = data.columns.flatMap((c) => c.tasks);

  async function handleDrop(id: string, toStatus: string) {
    const taskId = Number(id);
    const task = allTasks.find((t) => t.id === taskId);
    if (!task || task.status === toStatus || !onStatusChange) return;
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
    <KanbanBoard
      columns={data.columns.map((column) => ({
        key:   column.status,
        label: column.statusLabel,
        color: STATUS_COLOR[column.status] ?? colorForKey(column.status),
        items: column.tasks,
      }))}
      isAr={isAr}
      draggable={canDrag && !!onStatusChange}
      getId={(task: MyTask) => String(task.id)}
      renderCard={(task: MyTask) => (
        <MyTaskCard task={task} isAr={isAr} showProjectName={showProjectName} onOpen={onOpen} />
      )}
      onDrop={handleDrop}
    />
  );
}
