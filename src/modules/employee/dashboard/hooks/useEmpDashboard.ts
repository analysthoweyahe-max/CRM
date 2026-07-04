import { useQuery } from '@tanstack/react-query';
import { empDashboardApi } from '../api/dashboard.api';
import type { EmpTasksOverview } from '../types/dashboard.types';

const EMPTY_OVERVIEW: EmpTasksOverview = { totalAssigned: 0, inProgress: 0, completed: 0 };

export function useEmpDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['emp-dashboard'],
    queryFn:  () => empDashboardApi.get().then(r => r.data.data),
    staleTime: 60_000,
  });

  const overview = data?.tasksOverview ?? EMPTY_OVERVIEW;
  const pending  = Math.max(0, overview.totalAssigned - overview.inProgress - overview.completed);
  const sections = data?.myProjects?.sections ?? [];

  return { isLoading, isError, overview, pending, sections };
}
