import type { EmployeeTask } from '../types/employeeTask.types';

export interface TaskStatsCardsProps {
  tasks:     EmployeeTask[];
  isLoading: boolean;
  isAr:      boolean;
  activeStatus: string | null;
  onFilter:  (s: string | null) => void;
}
