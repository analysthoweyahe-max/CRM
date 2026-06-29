import { fmtDeadline, PRIORITY_MAP, STATUS_MAP } from './useTasksTable';
import type { EmployeeTask } from '../types/employeeTask.types';
import type { EmpTask } from '@/modules/employee/dashboard/types/empTask.types';

export function useTaskCard(task: EmployeeTask, isAr: boolean) {
  const status   = STATUS_MAP[task.status];
  const priority = PRIORITY_MAP[task.priority];
  const title    = isAr ? task.titleAr   : task.titleEn;
  const project  = isAr ? task.projectAr : task.projectEn;
  const deadline = fmtDeadline(task.deadline, isAr);
  const taskNum  = `#${task.id.toString().padStart(3, '0')}`;

  const empTask: EmpTask = {
    id: task.id,
    titleAr: task.titleAr,
    titleEn: task.titleEn,
    project,
    deadline,
    priority: task.priority,
  };

  return { status, priority, title, project, deadline, taskNum, empTask };
}
