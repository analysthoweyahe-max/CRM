import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { seoProjectStatusApi } from '../api/seoProjectStatus.api';
import type {
  ApiSeoProjectStatus, CreateSeoProjectStatusPayload, UpdateSeoProjectStatusPayload,
} from '../types/seoProjectStatus.types';

const ACTIVE_KEY = ['seo', 'project-statuses'] as const;
const MANAGE_KEY = ['seo', 'project-statuses', 'manage'] as const;

function invalidateLookups(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ACTIVE_KEY });
  qc.invalidateQueries({ queryKey: MANAGE_KEY });
  qc.invalidateQueries({ queryKey: ['create-project', 'seo', 'statuses'] });
  qc.invalidateQueries({ queryKey: ['seo-leader', 'dashboard'] });
  qc.invalidateQueries({ queryKey: ['seo', 'lookups', 'statuses'] });
}

/** Active catalog — dropdowns, filters, create form (any authenticated user). */
export function useSeoProjectStatuses() {
  return useQuery({
    queryKey: ACTIVE_KEY,
    queryFn:  () => seoProjectStatusApi.listActive(),
    staleTime: Infinity,
  });
}

/** Full catalog for CRUD admin (seo-manager / super-admin). */
export function useSeoProjectStatusesManage() {
  return useQuery({
    queryKey: MANAGE_KEY,
    queryFn:  () => seoProjectStatusApi.listManage().then((r) => toApiArray<ApiSeoProjectStatus>(r.data.data)),
  });
}

/** @deprecated Use useSeoProjectStatusesManage */
export const useSeoProjectStatusList = useSeoProjectStatusesManage;

export function useCreateSeoProjectStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSeoProjectStatusPayload) => seoProjectStatusApi.create(payload),
    onSuccess:  () => invalidateLookups(qc),
  });
}

export function useUpdateSeoProjectStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSeoProjectStatusPayload }) =>
      seoProjectStatusApi.update(id, payload),
    onSuccess: (r) => {
      qc.setQueryData(MANAGE_KEY, toApiArray<ApiSeoProjectStatus>(r.data.data));
      invalidateLookups(qc);
    },
  });
}

export function useDeleteSeoProjectStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => seoProjectStatusApi.remove(id),
    onSuccess: (r) => {
      qc.setQueryData(MANAGE_KEY, toApiArray<ApiSeoProjectStatus>(r.data.data));
      invalidateLookups(qc);
    },
  });
}
