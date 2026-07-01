import { useQuery }         from '@tanstack/react-query';
import { seoMemberDashboardApi } from '../api/seoMemberDashboard.api';
import type { EmployeeTask }     from '@/modules/employee/tasks/types/employeeTask.types';
import type { SeoMemberStats }   from '../types/seoMemberDashboard.types';

const EMPTY_STATS: SeoMemberStats = {
  completed: 0, needsReview: 0, inProgress: 0, pending: 0,
};

export function useSeoMemberDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['seo-member', 'dashboard'],
    queryFn:  () => seoMemberDashboardApi.get(),
    staleTime: 30_000,
  });

  const raw = data?.data?.data;

  const stats: SeoMemberStats = raw?.stats ?? EMPTY_STATS;

  // Map SeoMemberTaskRaw → EmployeeTask so TaskCard/TodayTasksList can be reused as-is
  const todayTasks: EmployeeTask[] = (raw?.todayTasks ?? []).map(t => ({
    id:        t.id,
    titleAr:   t.titleAr,
    titleEn:   t.titleEn,
    projectAr: t.campaignAr,
    projectEn: t.campaignEn,
    deadline:  t.deadline,
    priority:  t.priority,
    status:    t.status,
  }));

  return { stats, todayTasks, isLoading };
}
