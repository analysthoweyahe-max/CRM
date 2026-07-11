import { useQuery } from '@tanstack/react-query';
import { myProjectsApi } from '@/shared/modules/my-projects/api/myProjects.api';
import { seoMemberDashboardApi } from '../api/seoMemberDashboard.api';
import type { TasksOverview, ProjectSection } from '../types/seoMemberDashboard.types';

const EMPTY_OVERVIEW: TasksOverview = { totalAssigned: 0, inProgress: 0, completed: 0 };

export function useSeoMemberDashboard() {
  const dashboardQuery = useQuery({
    queryKey:  ['seo-member', 'dashboard'],
    queryFn:   () => seoMemberDashboardApi.get(),
    staleTime: 30_000,
  });

  /* Dashboard myProjects.sections is often empty for assigned members —
   * load the confirmed employee projects list for pickers / counts. */
  const projectsQuery = useQuery({
    queryKey:  ['seo-member', 'employee-projects'],
    queryFn:   () => myProjectsApi.listSeoEmployeeProjects(),
    staleTime: 30_000,
  });

  const raw = dashboardQuery.data?.data?.data;

  const tasksOverview: TasksOverview = raw?.tasksOverview ?? EMPTY_OVERVIEW;

  const sections: ProjectSection[] = (projectsQuery.data ?? []).length > 0
    ? [{
        key: 'all',
        label: 'projects',
        defaultExpanded: true,
        total: projectsQuery.data!.length,
        projects: projectsQuery.data!.map(p => ({
          id:     p.id,
          name:   p.name,
          status: p.status,
        })),
      }]
    : (raw?.myProjects?.sections ?? []);

  return {
    tasksOverview,
    sections,
    isLoading: dashboardQuery.isLoading || projectsQuery.isLoading,
    checkIn: raw?.checkIn ?? null,
  };
}
