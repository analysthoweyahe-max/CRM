import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { campaignApi } from '../../campaigns/api/campaign.api';
import { seoTeamApi } from '../../team/api/seoTeam.api';
import { filterSeoTeamMembers } from '@/shared/modules/team/utils/teamScope.utils';
import { normalizeGroupedTasks } from '@/shared/modules/my-tasks/utils/myTasks.utils';
import { seoLeaderDashboardApi } from '../api/seoLeaderDashboard.api';
import { useArchivedSeoProjects } from '../../campaigns/store/seoArchivedStore';
import type { SeoCampaign, SeoManagerStats } from '../types/dashboard.types';

export interface CampaignViewModel {
  id:                number;
  name:              string;
  description:       string;
  campaignType:      string;
  campaignTypeLabel: string;
  status:            string;
  statusLabel:       string;
  isDraft:           boolean;
  startDate:         string;
  expectedEndDate:   string | null;
  progress:          number;
  tasks_completed:   number;
  tasks_total:       number;
  team:              { name: string; initial: string; color: string }[];
  githubLink:        string | null;
}

function toCampaignVM(c: SeoCampaign): CampaignViewModel {
  return {
    id:                c.id,
    name:              c.name,
    description:       c.description,
    campaignType:      c.campaignType,
    campaignTypeLabel: c.campaignTypeLabel,
    status:            c.status,
    statusLabel:       c.statusLabel,
    isDraft:           c.isDraft === true,
    startDate:         c.startDate,
    expectedEndDate:   c.expectedEndDate,
    progress:          0,
    tasks_completed:   0,
    tasks_total:       0,
    team:              [],
    githubLink:        c.githubLink ?? null,
  };
}

function countPendingTasks(payload: unknown): number {
  const grouped = normalizeGroupedTasks(payload);
  return grouped.columns
    .filter(col => col.status === 'pending')
    .reduce((sum, col) => sum + col.tasks.length, 0);
}

export function useSeoLeaderDashboard() {
  const { user } = useAuth();
  const archivedIds = useArchivedSeoProjects();

  const projectsQuery = useQuery({
    queryKey:  ['seo-leader', 'projects'],
    queryFn:   () => seoLeaderDashboardApi.getProjects({ per_page: 100 }).then(r => r.data.data),
    staleTime: 2 * 60 * 1000,
  });

  const completedProjectsQuery = useQuery({
    queryKey:  ['seo-leader', 'projects', 'completed'],
    queryFn:   () =>
      seoLeaderDashboardApi
        .getProjects({ status: 'completed', per_page: 1 })
        .then(r => r.data.data.total ?? 0),
    staleTime: 2 * 60 * 1000,
  });

  const teamQuery = useQuery({
    queryKey:  ['seo-leader', 'dashboard', 'team'],
    queryFn:   () => seoTeamApi.getTeam({ per_page: 100 }).then(r => r.data.data),
    staleTime: 2 * 60 * 1000,
  });

  const pendingTasksQuery = useQuery({
    queryKey:  ['seo-leader', 'dashboard', 'pending-tasks'],
    queryFn:   async () => {
      const res = await campaignApi.listAllTasks({ per_page: 100 });
      return countPendingTasks(res.data);
    },
    staleTime: 2 * 60 * 1000,
  });

  const campaigns = useMemo(() => {
    return (projectsQuery.data?.data ?? []).map(c => {
      const vm = toCampaignVM(c);
      if (archivedIds.has(c.id)) return { ...vm, status: 'archived', statusLabel: 'مؤرشفة' };
      return vm;
    });
  }, [projectsQuery.data, archivedIds]);

  const activeEmployees = useMemo(() => {
    const members = teamQuery.data?.data ?? [];
    const scoped = filterSeoTeamMembers(members, {
      viewerId: user?.employeeId,
      isAdmin:  user?.role === 'admin',
    });
    return scoped.filter(m => m.isActive || m.status === 'active').length;
  }, [teamQuery.data, user?.employeeId, user?.role]);

  const stats: SeoManagerStats = {
    total_projects:     projectsQuery.data?.total ?? campaigns.length,
    active_employees:   activeEmployees,
    pending_tasks:      pendingTasksQuery.data ?? 0,
    completed_projects: completedProjectsQuery.data ?? 0,
  };

  const isLoading =
    projectsQuery.isLoading
    || completedProjectsQuery.isLoading
    || teamQuery.isLoading
    || pendingTasksQuery.isLoading;

  return {
    isLoading,
    isError: projectsQuery.isError,
    stats,
    campaigns,
  };
}
