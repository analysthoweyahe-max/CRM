import { toast } from 'sonner';
import type { GroupedTasksData, MyTask } from '../types/myTasks.types';
import { MyTasksKanbanColumn } from './MyTasksKanbanColumn';

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

  async function handleDrop(taskId: number, toStatus: string) {
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
    <div className="flex gap-5 overflow-x-auto pb-4 px-1">
      {data.columns.map((column) => (
        <MyTasksKanbanColumn
          key={column.status}
          column={column}
          isAr={isAr}
          showProjectName={showProjectName}
          canDrag={canDrag && !!onStatusChange}
          onOpen={onOpen}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
