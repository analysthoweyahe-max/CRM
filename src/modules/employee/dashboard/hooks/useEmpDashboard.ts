import { useQuery } from '@tanstack/react-query';
import { empDashboardApi } from '../api/dashboard.api';
import { useEmployeeTasks } from '@/modules/employee/tasks/hooks/useEmployeeTasks';
import type { EmpTasksOverview, EmpProject } from '../types/dashboard.types';

const EMPTY_OVERVIEW: EmpTasksOverview = { totalAssigned: 0, inProgress: 0, completed: 0 };

// tasksOverview is derived from the real task list — /v1/pm/dashboard returns the
// PM manager's own stats shape, not an employee-scoped tasksOverview.
export function useEmpDashboard() {
  const { data: tasks = [], isLoading: tasksLoading } = useEmployeeTasks();

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['emp-dashboard', 'my-projects'],
    queryFn:  () => empDashboardApi.myProjects(),
    staleTime: 60_000,
  });

  const overview: EmpTasksOverview = {
    totalAssigned: tasks.length,
    inProgress:    tasks.filter(t => t.status === 'inProgress').length,
    completed:     tasks.filter(t => t.status === 'completed').length,
  };
  const pending = Math.max(0, overview.totalAssigned - overview.inProgress - overview.completed);

  const projects: EmpProject[] = projectsData?.data?.data?.data ?? [];

  return {
    isLoading: tasksLoading || projectsLoading,
    overview: tasks.length ? overview : EMPTY_OVERVIEW,
    pending,
    projects,
  };
}
