import { useQuery } from '@tanstack/react-query';
import { taskDetailApi } from '../api/taskDetail.api';

export function useTaskDetail(id: string) {
  return useQuery({
    queryKey: ['task-detail', id],
    queryFn: async () => (await taskDetailApi.get(id)).data,
    enabled: !!id,
  });
}

export function useTaskComments(id: string) {
  return useQuery({
    queryKey: ['task-comments', id],
    queryFn: async () => (await taskDetailApi.getComments(id)).data,
    enabled: !!id,
  });
}

export function useTaskSessions(id: string) {
  return useQuery({
    queryKey: ['task-sessions', id],
    queryFn: async () => (await taskDetailApi.getSessions(id)).data,
    enabled: !!id,
  });
}
