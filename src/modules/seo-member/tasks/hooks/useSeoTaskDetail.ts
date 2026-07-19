import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { seoTaskDetailApi } from '../api/seoTaskDetail.api';
import type { SeoUpdateTaskPayload } from '../api/seoTaskDetail.api';
import type { SeoTaskStatus } from '../types/seoTask.types';
import type { SeoTaskComment } from '../types/seoTaskDetail.types';
import type { TaskComment, EditCommentPayload, SendCommentPayload, TaskTimeLogSummary } from '@/modules/employee/tasks/types/taskDetail.types';
import { extractSeoUploadErrors } from '@/shared/utils/seoTaskAttachment.utils';
import { extractApiError, extractEditApiError, extractApiStatus } from '@/shared/utils/error.utils';
import { toMentionRefs } from '@/shared/utils/mentionComposer.utils';
import {
  isSameActorId,
  normalizeTaskCommentFields,
} from '@/shared/utils/chatNormalize.utils';
import { normalizeTimeLogSummary } from '@/shared/utils/timeLog.utils';
import { useAuth } from '@/modules/auth/context/AuthContext';

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
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: detailKey(projectId, taskId) });
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
      qc.invalidateQueries({ queryKey: ['seo-member', 'tasks'] });
      qc.invalidateQueries({ queryKey: ['seo-member', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['seo-member', 'employee-projects'] });
      qc.invalidateQueries({ queryKey: ['seo-leader', 'dashboard'] });
      qc.invalidateQueries({ queryKey: ['campaign-tasks', projectId] });
      toast.success(isAr ? 'تم تحديث الحالة' : 'Status updated');
    },
    onError: () => toast.error(isAr ? 'تعذّر تحديث الحالة' : 'Failed to update status'),
  });
}

export function useUpdateSeoTask(projectId: string | undefined, taskId: string | undefined, isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SeoUpdateTaskPayload) => seoTaskDetailApi.updateTask(projectId!, taskId!, payload),
    onSuccess: (detail) => {
      qc.setQueryData(detailKey(projectId, taskId), (prev: { task: typeof detail; tabs?: unknown } | undefined) =>
        prev ? { ...prev, task: detail } : { task: detail },
      );
      qc.invalidateQueries({ queryKey: ['my-tasks'] });
      qc.invalidateQueries({ queryKey: ['seo-member', 'tasks'] });
      toast.success(isAr ? 'تم حفظ التعديلات' : 'Changes saved');
    },
    onError: (err) => toast.error(extractApiError(err) || (isAr ? 'تعذّر حفظ التعديلات' : 'Failed to save changes')),
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

function mapSeoComments(
  comments: SeoTaskComment[],
  user?: { id?: string | null; employeeId?: string | null } | null,
): TaskComment[] {
  return comments.map((c) => {
    const edit = normalizeTaskCommentFields(c);
    return {
      id:        String(c.id),
      authorAr:  c.sender.name,
      authorEn:  c.sender.name,
      initials:  c.sender.name.charAt(0).toUpperCase(),
      avatarBg:  'bg-brand-500',
      body:      c.body,
      createdAt: c.sentAt,
      isMine:    isSameActorId(c.sender.id, user),
      mentions:  edit.mentions ?? toMentionRefs(c.mentions),
      isEdited:  edit.isEdited,
      editedAt:  edit.editedAt,
      replies:   mapSeoComments(c.replies ?? [], user),
    };
  });
}

export function useSeoTaskComments(projectId: string | undefined, taskId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['seo-member', 'task-comments', projectId, taskId],
    queryFn: async () => {
      const res = await seoTaskDetailApi.getComments(projectId!, taskId!);
      return mapSeoComments(res.data.data?.data ?? [], user);
    },
    enabled: !!projectId && !!taskId,
  });
}

export function useAddSeoTaskComment(projectId: string | undefined, taskId: string | undefined, isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendCommentPayload) =>
      seoTaskDetailApi.addComment(projectId!, taskId!, payload.body, {
        parentId: payload.parentId,
        mentions: payload.mentions,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seo-member', 'task-comments', projectId, taskId] });
      qc.invalidateQueries({ queryKey: detailKey(projectId, taskId) });
    },
    onError: () => toast.error(isAr ? 'تعذّر إرسال التعليق' : 'Failed to send comment'),
  });
}

export function useUpdateSeoTaskComment(projectId: string | undefined, taskId: string | undefined, isAr: boolean) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EditCommentPayload) =>
      seoTaskDetailApi.updateComment(projectId!, taskId!, payload.id, {
        body: payload.body,
        mentions: payload.mentions,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seo-member', 'task-comments', projectId, taskId] });
      qc.invalidateQueries({ queryKey: detailKey(projectId, taskId) });
    },
    onError: (err) => {
      if (extractApiStatus(err) === 404) {
        qc.invalidateQueries({ queryKey: ['seo-member', 'task-comments', projectId, taskId] });
      }
      toast.error(extractEditApiError(err, { isAr, kind: 'comment' }));
    },
  });
}

const sessionsKey = (projectId?: string, taskId?: string) =>
  ['seo-member', 'task-sessions', projectId, taskId] as const;

export function useSeoTaskSessions(
  projectId: string | undefined,
  taskId: string | undefined,
  fallbackEstimatedHours = 0,
) {
  return useQuery({
    queryKey: [...sessionsKey(projectId, taskId), fallbackEstimatedHours],
    queryFn: async (): Promise<TaskTimeLogSummary> => {
      const res = await seoTaskDetailApi.getTimeLogs(projectId!, taskId!);
      return normalizeTimeLogSummary(res.data.data, fallbackEstimatedHours);
    },
    enabled: !!projectId && !!taskId,
    refetchInterval: 15_000,
  });
}

export function useCreateSeoTaskSession(projectId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { workDate: string; startedAt: string; endedAt: string; notes?: string }) =>
      seoTaskDetailApi.addTimeLog(projectId, taskId, {
        work_date:  payload.workDate,
        started_at: payload.startedAt,
        ended_at:   payload.endedAt,
        notes:      payload.notes,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKey(projectId, taskId) }),
  });
}

export function useDeleteSeoTaskSession(projectId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => seoTaskDetailApi.deleteTimeLog(projectId, taskId, sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: sessionsKey(projectId, taskId) }),
  });
}
