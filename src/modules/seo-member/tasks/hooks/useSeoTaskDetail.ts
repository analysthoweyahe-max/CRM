import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seoTaskDetailApi } from '../api/seoTaskDetail.api';
import type { SeoTaskStatus } from '../types/seoTask.types';
import type { SeoTaskComment } from '../types/seoTaskDetail.types';
import type { TaskComment, TaskSession } from '@/modules/employee/tasks/types/taskDetail.types';
import { extractSeoUploadErrors } from '@/shared/utils/seoTaskAttachment.utils';

const detailKey = (projectId?: string, taskId?: string) =>
  ['seo-member', 'task-detail', projectId, taskId] as const;

export function useSeoTaskDetail(projectId: string | undefined, taskId: string | undefined) {
  return useQuery({
    queryKey: detailKey(projectId, taskId),
    queryFn:  async () => {
      const res = await seoTaskDetailApi.getById(projectId!, taskId!);
      return res;
    },
    enabled:  !!projectId && !!taskId,
    staleTime: 30_000,
  });
}

export function useUpdateSeoTaskStatus(projectId: string | undefined, taskId: string | undefined, isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: SeoTaskStatus) => seoTaskDetailApi.updateStatus(projectId!, taskId!, status),
    onSuccess: (detail) => {
      qc.setQueryData(detailKey(projectId, taskId), (prev: { task: typeof detail; tabs?: unknown } | undefined) =>
        prev ? { ...prev, task: detail } : { task: detail },
      );
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
      qc.invalidateQueries({ queryKey: ['seo-member', 'tasks'] });
      toast.success(isAr ? 'تم تحديث الحالة' : 'Status updated');
    },
    onError: () => toast.error(isAr ? 'تعذّر تحديث الحالة' : 'Failed to update status'),
  });
}

export function useUploadSeoTaskAttachments(
  projectId: string | undefined,
  taskId: string | undefined,
  isAr: boolean,
) {
  const qc = useQueryClient();
  const [uploadError, setUploadError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (files: File[]) => seoTaskDetailApi.uploadAttachments(projectId!, taskId!, files),
    onSuccess: (res) => {
      setUploadError(null);
      const { attachments, attachmentsCount } = res.data.data;
      qc.setQueryData(detailKey(projectId, taskId), (prev: { task: { attachments: unknown[]; attachmentsCount: number }; tabs?: { attachmentsCount?: number } } | undefined) => {
        if (!prev) return prev;
        return {
          ...prev,
          task: { ...prev.task, attachments, attachmentsCount },
          tabs: { ...prev.tabs, attachmentsCount },
        };
      });
      toast.success(isAr ? 'تم رفع المرفقات' : 'Attachments uploaded');
    },
    onError: (err) => {
      const msg = extractSeoUploadErrors(err);
      setUploadError(msg);
      toast.error(msg);
    },
  });

  return {
    uploadFiles: (files: File[]) => mutation.mutate(files),
    isUploading: mutation.isPending,
    uploadError,
    clearUploadError: () => setUploadError(null),
  };
}

export function useDeleteSeoTaskAttachment(
  projectId: string | undefined,
  taskId: string | undefined,
  isAr: boolean,
) {
  const qc = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const mutation = useMutation({
    mutationFn: (attachmentId: number) => {
      setDeletingId(attachmentId);
      return seoTaskDetailApi.deleteAttachment(projectId!, taskId!, attachmentId);
    },
    onSuccess: (res) => {
      const { attachments, attachmentsCount } = res.data.data;
      qc.setQueryData(detailKey(projectId, taskId), (prev: { task: { attachments: unknown[]; attachmentsCount: number }; tabs?: { attachmentsCount?: number } } | undefined) => {
        if (!prev) return prev;
        return {
          ...prev,
          task: { ...prev.task, attachments, attachmentsCount },
          tabs: { ...prev.tabs, attachmentsCount },
        };
      });
      toast.success(isAr ? 'تم حذف المرفق' : 'Attachment deleted');
    },
    onError: (err) => toast.error(extractSeoUploadErrors(err)),
    onSettled: () => setDeletingId(null),
  });

  return {
    deleteAttachment: (id: number) => mutation.mutate(id),
    deletingId,
    isDeleting: mutation.isPending,
  };
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
