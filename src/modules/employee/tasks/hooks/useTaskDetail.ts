import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { taskDetailApi } from '../api/taskDetail.api';
import type { EmpTaskStatus } from '../types/employeeTask.types';

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

export function useTaskComments(projectId: string, taskId: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['task-comments', projectId, taskId],
    queryFn: async () => (await taskDetailApi.getComments(projectId, taskId, user?.employeeId)).data,
    enabled: !!projectId && !!taskId,
  });
}

export function useCreateComment(projectId: string, taskId: string) {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => taskDetailApi.createComment(projectId, taskId, body, user?.employeeId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task-comments', projectId, taskId] }),
  });
}

export function useTaskSessions(projectId: string, taskId: string) {
  return useQuery({
    queryKey: ['task-sessions', projectId, taskId],
    queryFn: async () => (await taskDetailApi.getSessions(projectId, taskId)).data,
    enabled: !!projectId && !!taskId,
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
