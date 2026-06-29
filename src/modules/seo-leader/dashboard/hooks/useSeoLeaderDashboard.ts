import { useQuery }                  from '@tanstack/react-query';
import { seoLeaderDashboardApi }      from '../api/seoLeaderDashboard.api';
import { getAvatarColor, getInitial } from '@/shared/utils/avatar.utils';
import type { SeoCampaign }           from '../types/dashboard.types';

export interface CampaignViewModel extends Omit<SeoCampaign, 'team'> {
  team: { name: string; initial: string; color: string }[];
}

function toCampaignVM(c: SeoCampaign): CampaignViewModel {
  return {
    ...c,
    team: c.team.map(m => ({
      name:    m.name,
      initial: getInitial(m.name),
      color:   getAvatarColor(m.name),
    })),
  };
}

export function useSeoLeaderDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['seo-leader', 'dashboard'],
    queryFn:  () => seoLeaderDashboardApi.get().then(r => r.data.data),
    staleTime: 2 * 60 * 1000,
  });

  const rawProjects = data?.projects;
  const campaignsList: SeoCampaign[] = Array.isArray(rawProjects)
    ? rawProjects
    : (rawProjects as { data?: SeoCampaign[] } | undefined)?.data ?? [];

  return {
    isLoading,
    isError,
    stats:     data?.stats,
    campaigns: campaignsList.map(toCampaignVM),
  };
}
