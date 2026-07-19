import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { pmTaskStatusApi } from '../api/pmTaskStatus.api';
import type {
  ApiPmTaskStatus, CreatePmTaskStatusPayload, UpdatePmTaskStatusPayload,
} from '../types/pmTaskStatus.types';

const KEY = ['pm', 'task-statuses', 'manage'] as const;

function invalidateLookups(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: KEY });
  qc.invalidateQueries({ queryKey: ['pm', 'task-statuses'] });
  qc.invalidateQueries({ queryKey: ['pm-task-lookups'] });
}

export function usePmTaskStatusList() {
  return useQuery({
    queryKey: KEY,
    queryFn:  () => pmTaskStatusApi.list().then((r) => toApiArray<ApiPmTaskStatus>(r.data.data)),
  });
}

export function useCreatePmTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePmTaskStatusPayload) => pmTaskStatusApi.create(payload),
    onSuccess:  () => invalidateLookups(qc),
  });
}

export function useUpdatePmTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePmTaskStatusPayload }) =>
      pmTaskStatusApi.update(id, payload),
    onSuccess: (r) => {
      qc.setQueryData(KEY, toApiArray<ApiPmTaskStatus>(r.data.data));
      invalidateLookups(qc);
    },
  });
}

export function useDeletePmTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pmTaskStatusApi.remove(id),
    onSuccess: (r) => {
      qc.setQueryData(KEY, toApiArray<ApiPmTaskStatus>(r.data.data));
      invalidateLookups(qc);
    },
  });
}
