import type { EmployeeTask } from '../types/employeeTask.types';

export interface TasksTableProps {
  tasks:     EmployeeTask[];
  isLoading: boolean;
  isAr:      boolean;
}
