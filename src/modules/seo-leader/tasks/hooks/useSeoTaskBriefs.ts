import { useQuery } from '@tanstack/react-query';
import { seoTaskBriefsApi } from '../api/seoTaskBriefs.api';

export function useSeoTaskBriefs(status: string, projectId: string, page: number, options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['seo-task-briefs', status, projectId, page],
    queryFn:  () => seoTaskBriefsApi.list({ status, projectId, page }).then(r => r.data.data),
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
