import { useQuery } from '@tanstack/react-query';
import { seoTaskBriefsApi } from '../api/seoTaskBriefs.api';

export function useSeoTaskStats(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['seo-task-stats'],
    queryFn:  () => seoTaskBriefsApi.stats().then(r => r.data.data),
    staleTime: 60_000,
    enabled,
  });

  return {
    total:    data?.total ?? 0,
    byStatus: data?.byStatus ?? [],
    isLoading,
    isError,
  };
}
