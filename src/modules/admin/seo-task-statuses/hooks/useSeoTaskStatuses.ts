import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { seoTaskStatusApi } from '../api/seoTaskStatus.api';
import type {
  ApiSeoTaskStatus, CreateSeoTaskStatusPayload, UpdateSeoTaskStatusPayload,
} from '../types/seoTaskStatus.types';

const KEY = ['admin', 'seo-task-statuses'];

export function useSeoTaskStatusList() {
  return useQuery({
    queryKey: KEY,
    queryFn:  () => seoTaskStatusApi.list().then((r) => toApiArray<ApiSeoTaskStatus>(r.data.data)),
  });
}

export function useCreateSeoTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSeoTaskStatusPayload) => seoTaskStatusApi.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateSeoTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSeoTaskStatusPayload }) =>
      seoTaskStatusApi.update(id, payload),
    // The backend returns the refreshed list on update — use it directly instead of refetching.
    onSuccess:  (r) => qc.setQueryData(KEY, toApiArray<ApiSeoTaskStatus>(r.data.data)),
  });
}

export function useDeleteSeoTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => seoTaskStatusApi.remove(id),
    onSuccess:  (r) => qc.setQueryData(KEY, toApiArray<ApiSeoTaskStatus>(r.data.data)),
  });
}
