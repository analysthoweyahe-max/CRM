import type { EmployeeTask } from '../types/employeeTask.types';

export interface TaskListProps {
  tasks:     EmployeeTask[];
  isLoading: boolean;
  isAr:      boolean;
}
