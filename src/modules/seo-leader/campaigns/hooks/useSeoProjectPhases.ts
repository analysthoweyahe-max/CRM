import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '../api/campaign.api';
import { seoPhaseQueryKeys } from '../utils/seoPhase.utils';

export function useSeoProjectPhases(projectKey: string) {
  return useQuery({
    queryKey: seoPhaseQueryKeys(projectKey).phases,
    queryFn:  () => campaignApi.getPhases(projectKey),
    enabled:  !!projectKey,
    staleTime: 30_000,
    retry: 1,
  });
}
