import { useQuery } from '@tanstack/react-query';
import { pmTaskBriefsApi } from '../api/taskBriefs.api';

export function usePmTaskStats(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['pm-task-stats'],
    queryFn:  () => pmTaskBriefsApi.stats().then(r => r.data.data),
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
