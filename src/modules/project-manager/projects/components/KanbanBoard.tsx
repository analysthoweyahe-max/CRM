import type { Task, TaskStatus } from '../../tasks/types/task.types';
import { moveTask } from '../../tasks/store/taskStore';
import { KanbanColumn } from './KanbanColumn';

const COLUMNS: TaskStatus[] = ['pending', 'inProgress', 'review', 'completed'];

interface Props {
  tasks: Task[];
  isAr:  boolean;
}

export function KanbanBoard({ tasks, isAr }: Props) {
  function handleDrop(taskId: string, toStatus: TaskStatus) {
    moveTask(taskId, toStatus);
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {COLUMNS.map(status => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasks.filter(t => t.status === status)}
          isAr={isAr}
          onDrop={handleDrop}
        />
      ))}
    </div>
  );
}
