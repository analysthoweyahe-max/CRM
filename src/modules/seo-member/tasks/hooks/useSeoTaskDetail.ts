import { useQuery } from '@tanstack/react-query';
import { seoTaskDetailApi } from '../api/seoTaskDetail.api';

export function useSeoTaskDetail(taskId: string | undefined) {
  return useQuery({
    queryKey: ['seo-member', 'task-detail', taskId],
    queryFn:  () => seoTaskDetailApi.getById(undefined, taskId ?? ''),
    enabled:  !!taskId,
    select:   res => res.data,
    staleTime: 30_000,
  });
}
