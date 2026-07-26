import { useQuery } from '@tanstack/react-query';
import { pmTaskBriefsApi } from '../api/taskBriefs.api';

export function usePmTaskBriefs(status: string, projectId: string, page: number, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['pm-task-briefs', status, projectId, page],
    queryFn:  () => pmTaskBriefsApi.list({ status, projectId, page }).then(r => r.data.data),
    staleTime: 60_000,
    enabled,
  });

  return {
    tasks:    data?.data ?? [],
    page:     data?.current_page ?? page,
    lastPage: data?.last_page ?? 1,
    total:    data?.total ?? 0,
    perPage:  data?.per_page ?? 12,
    isLoading,
    isError,
  };
}
