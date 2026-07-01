import type { EmployeeTask } from '../types/employeeTask.types';

export interface TaskCardProps {
  task:          EmployeeTask;
  isAr:          boolean;
  onDetails?:    (id: string) => void;
  projectLabel?: { ar: string; en: string };
}
