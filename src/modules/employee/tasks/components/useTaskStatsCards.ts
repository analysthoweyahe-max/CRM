import type { EmployeeTask } from '../types/employeeTask.types';

export function useTaskStatsCards(tasks: EmployeeTask[]) {
  let inProgress = 0, completed = 0, pending = 0;
  for (const t of tasks) {
    if (t.status === 'inProgress') inProgress++;
    else if (t.status === 'completed') completed++;
    else if (t.status === 'pending') pending++;
  }
  return { total: tasks.length, inProgress, completed, pending };
}
