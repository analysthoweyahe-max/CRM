import { TaskCard } from '@/modules/employee/tasks/components/TaskCard';
import type { EmployeeTask } from '@/modules/employee/tasks/types/employeeTask.types';

interface TodayTasksListProps {
  tasks: EmployeeTask[];
  isAr:  boolean;
}

export function TodayTasksList({ tasks, isAr }: TodayTasksListProps) {
  if (!tasks.length) {
    return (
      <p className="text-sm text-gray-400 text-center py-8">
        {isAr ? 'لا توجد مهام اليوم' : 'No tasks for today'}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => <TaskCard key={task.id} task={task} isAr={isAr} />)}
    </div>
  );
}
