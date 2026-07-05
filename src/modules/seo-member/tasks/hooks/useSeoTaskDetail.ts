import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seoTaskDetailApi } from '../api/seoTaskDetail.api';
import type { SeoTaskStatus } from '../types/seoTask.types';

export function useSeoTaskDetail(projectId: string | undefined, taskId: string | undefined) {
  return useQuery({
    queryKey: ['seo-member', 'task-detail', projectId, taskId],
    queryFn:  () => seoTaskDetailApi.getById(projectId!, taskId!),
    enabled:  !!projectId && !!taskId,
    staleTime: 30_000,
  });
}

export function useUpdateSeoTaskStatus(projectId: string | undefined, taskId: string | undefined, isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: SeoTaskStatus) => seoTaskDetailApi.updateStatus(projectId!, taskId!, status),
    onSuccess: (detail) => {
      qc.setQueryData(['seo-member', 'task-detail', projectId, taskId], detail);
      qc.invalidateQueries({ queryKey: ['seo-member', 'tasks'] });
      toast.success(isAr ? 'تم تحديث الحالة' : 'Status updated');
    },
    onError: () => toast.error(isAr ? 'تعذّر تحديث الحالة' : 'Failed to update status'),
  });
}
