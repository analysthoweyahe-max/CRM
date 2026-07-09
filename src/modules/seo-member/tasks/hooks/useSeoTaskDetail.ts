import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seoTaskDetailApi } from '../api/seoTaskDetail.api';
import type { SeoTaskStatus } from '../types/seoTask.types';
import type { SeoTaskComment } from '../types/seoTaskDetail.types';
import type { TaskComment, TaskSession } from '@/modules/employee/tasks/types/taskDetail.types';

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
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
      qc.invalidateQueries({ queryKey: ['seo-member', 'tasks'] });
      toast.success(isAr ? 'تم تحديث الحالة' : 'Status updated');
    },
    onError: () => toast.error(isAr ? 'تعذّر تحديث الحالة' : 'Failed to update status'),
  });
}

function mapSeoComments(comments: SeoTaskComment[]): TaskComment[] {
  return comments.map((c) => ({
    id:        String(c.id),
    authorAr:  c.sender.name,
    authorEn:  c.sender.name,
    initials:  c.sender.name.charAt(0).toUpperCase(),
    avatarBg:  'bg-brand-500',
    body:      c.body,
    createdAt: c.sentAt,
    isMine:    false,
  }));
}

export function useSeoTaskComments(projectId: string | undefined, taskId: string | undefined) {
  return useQuery({
    queryKey: ['seo-member', 'task-comments', projectId, taskId],
    queryFn: async () => {
      const res = await seoTaskDetailApi.getComments(projectId!, taskId!);
      return mapSeoComments(res.data.data?.data ?? []);
    },
    enabled: !!projectId && !!taskId,
  });
}

export function useSeoTaskSessions(projectId: string | undefined, taskId: string | undefined) {
  return useQuery({
    queryKey: ['seo-member', 'task-sessions', projectId, taskId],
    queryFn: async () => {
      const res = await seoTaskDetailApi.getTimeLogs(projectId!, taskId!);
      const sessions: TaskSession[] = (res.data.data.sessions ?? []).map((s) => ({
        id:            String(s.id),
        date:          s.workDate,
        from:          s.startedAt,
        to:            s.endedAt,
        durationHours: s.durationHours,
      }));
      return sessions;
    },
    enabled: !!projectId && !!taskId,
  });
}
