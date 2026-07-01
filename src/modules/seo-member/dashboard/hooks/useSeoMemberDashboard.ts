import { useQuery }                from '@tanstack/react-query';
import { seoMemberDashboardApi }   from '../api/seoMemberDashboard.api';
import type { TasksOverview, ProjectSection } from '../types/seoMemberDashboard.types';

const EMPTY_OVERVIEW: TasksOverview = { totalAssigned: 0, inProgress: 0, completed: 0 };

export function useSeoMemberDashboard() {
  const { data, isLoading } = useQuery({
    queryKey:  ['seo-member', 'dashboard'],
    queryFn:   () => seoMemberDashboardApi.get(),
    staleTime: 30_000,
  });

  const raw = data?.data?.data;

  const tasksOverview: TasksOverview     = raw?.tasksOverview ?? EMPTY_OVERVIEW;
  const sections: ProjectSection[]       = raw?.myProjects?.sections ?? [];

  return { tasksOverview, sections, isLoading };
}
