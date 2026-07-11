import { useQuery } from '@tanstack/react-query';
import { myProjectsApi } from '@/shared/modules/my-projects/api/myProjects.api';
import { groupSeoProjectsIntoSections } from '@/shared/modules/my-projects/utils/myProjects.utils';
import { useLang } from '@/app/providers/LanguageProvider';
import { seoMemberDashboardApi } from '../api/seoMemberDashboard.api';
import type { TasksOverview } from '../types/seoMemberDashboard.types';
import type { SeoProject } from '@/shared/modules/my-projects/types/myProjects.types';

const EMPTY_OVERVIEW: TasksOverview = { totalAssigned: 0, inProgress: 0, completed: 0 };

export function useSeoMemberDashboard() {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  const dashboardQuery = useQuery({
    queryKey:  ['seo-member', 'dashboard'],
    queryFn:   () => seoMemberDashboardApi.get(),
    staleTime: 30_000,
  });

  /** All projects assigned to this SEO employee — GET /v1/seo/employee/projects */
  const projectsQuery = useQuery({
    queryKey:  ['seo-member', 'employee-projects'],
    queryFn:   () => myProjectsApi.listSeoEmployeeProjects(),
    staleTime: 30_000,
  });

  const raw = dashboardQuery.data?.data?.data;
  const projects: SeoProject[] = projectsQuery.data ?? [];
  const sections = groupSeoProjectsIntoSections(projects, isAr);

  const tasksOverview: TasksOverview = raw?.tasksOverview ?? EMPTY_OVERVIEW;

  return {
    tasksOverview,
    projects,
    sections,
    isLoading: dashboardQuery.isLoading || projectsQuery.isLoading,
    isProjectsError: projectsQuery.isError,
    checkIn: raw?.checkIn ?? null,
  };
}
