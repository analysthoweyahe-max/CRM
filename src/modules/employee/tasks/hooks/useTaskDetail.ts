import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { useLang } from '@/app/providers/LanguageProvider';
import { extractEditApiError, extractApiStatus } from '@/shared/utils/error.utils';
import { taskDetailApi } from '../api/taskDetail.api';
import { normalizeTimeLogSummary } from '@/shared/utils/timeLog.utils';
import type { EmpTaskStatus } from '../types/employeeTask.types';
import type { UpdateTaskPayload, SendCommentPayload, EditCommentPayload, TaskTimeLogSummary } from '../types/taskDetail.types';

export function useTaskDetail(projectId: string, taskId: string) {
  return useQuery({
    queryKey: ['task-detail', projectId, taskId],
    queryFn: async () => (await taskDetailApi.get(projectId, taskId)).data,
    enabled: !!projectId && !!taskId,
  });
}

export function useUpdateTaskStatus(projectId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: EmpTaskStatus) => taskDetailApi.updateStatus(projectId, taskId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-detail', projectId, taskId] });
      qc.invalidateQueries({ queryKey: ['employee', 'tasks'] });
    },
  });
}

export function useUpdateTask(projectId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTaskPayload) => taskDetailApi.update(projectId, taskId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['task-detail', projectId, taskId] });
      qc.invalidateQueries({ queryKey: ['employee', 'tasks'] });
    },
  });
}

export function useTaskComments(projectId: string, taskId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['task-comments', projectId, taskId],
    queryFn: async () => (await taskDetailApi.getComments(projectId, taskId, user)).data,
    enabled: !!projectId && !!taskId,
  });
}

export function useCreateComment(projectId: string, taskId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendCommentPayload) =>
      taskDetailApi.createComment(projectId, taskId, payload, user),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task-comments', projectId, taskId] }),
  });
}

export function useUpdateComment(projectId: string, taskId: string) {
  const { user } = useAuth();
  const { lang } = useLang();
  const isAr = lang === 'ar';
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EditCommentPayload) =>
      taskDetailApi.updateComment(projectId, taskId, payload.id, payload, user),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task-comments', projectId, taskId] }),
    onError: (err) => {
      if (extractApiStatus(err) === 404) {
        qc.invalidateQueries({ queryKey: ['task-comments', projectId, taskId] });
      }
      toast.error(extractEditApiError(err, { isAr, kind: 'comment' }));
    },
  });
}

export function useTaskSessions(projectId: string, taskId: string, fallbackEstimatedHours = 0) {
  return useQuery({
    queryKey: ['task-sessions', projectId, taskId, fallbackEstimatedHours],
    queryFn: async (): Promise<TaskTimeLogSummary> => {
      const res = await taskDetailApi.getSessions(projectId, taskId);
      return normalizeTimeLogSummary(res.data, fallbackEstimatedHours);
    },
    enabled: !!projectId && !!taskId,
    refetchInterval: 15_000,
  });
}

export function useCreateSession(projectId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { workDate: string; startedAt: string; endedAt: string; notes?: string }) =>
      taskDetailApi.createSession(projectId, taskId, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task-sessions', projectId, taskId] }),
  });
}

export function useDeleteSession(projectId: string, taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (sessionId: string) => taskDetailApi.deleteSession(projectId, taskId, sessionId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task-sessions', projectId, taskId] }),
  });
}
