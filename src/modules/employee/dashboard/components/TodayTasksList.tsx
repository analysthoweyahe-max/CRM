import { TaskCard } from '@/modules/employee/tasks/components/TaskCard';
import type { EmployeeTask } from '@/modules/employee/tasks/types/employeeTask.types';

interface TodayTasksListProps {
  tasks:          EmployeeTask[];
  isAr:           boolean;
  onTaskDetails?: (id: string) => void;
}

export function TodayTasksList({ tasks, isAr, onTaskDetails }: TodayTasksListProps) {
  if (!tasks.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        {isAr ? 'لا توجد مهام اليوم' : 'No tasks for today'}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} isAr={isAr} onDetails={onTaskDetails} />
      ))}
    </div>
  );
}
