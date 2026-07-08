import { useQuery }                from '@tanstack/react-query';
import { seoLeaderDashboardApi }   from '../api/seoLeaderDashboard.api';
import { useArchivedSeoProjects }  from '../../campaigns/store/seoArchivedStore';
import type { SeoCampaign }        from '../types/dashboard.types';

export interface CampaignViewModel {
  id:                number;
  name:              string;
  description:       string;
  campaignType:      string;
  campaignTypeLabel: string;
  status:            string;
  statusLabel:       string;
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
    startDate:         c.startDate,
    expectedEndDate:   c.expectedEndDate,
    progress:          0,
    tasks_completed:   0,
    tasks_total:       0,
    team:              [],
    githubLink:        c.githubLink ?? null,
  };
}

export function useSeoLeaderDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['seo-leader', 'projects'],
    queryFn:  () => seoLeaderDashboardApi.getProjects().then(r => r.data.data),
    staleTime: 2 * 60 * 1000,
  });

  const archivedIds = useArchivedSeoProjects();

  const campaigns = (data?.data ?? []).map(c => {
    const vm = toCampaignVM(c);
    if (archivedIds.has(c.id)) return { ...vm, status: 'archived', statusLabel: 'مؤرشفة' };
    return vm;
  });

  const stats = {
    total_projects:     campaigns.length,
    active_employees:   0,
    pending_tasks:      campaigns.filter(c => c.status === 'not_started').length,
    completed_projects: campaigns.filter(c => c.status === 'completed').length,
  };

  return { isLoading, isError, stats, campaigns };
}
