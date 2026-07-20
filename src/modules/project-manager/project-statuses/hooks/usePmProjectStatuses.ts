import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { pmProjectStatusApi } from '../api/pmProjectStatus.api';
import type {
  ApiPmProjectStatus, CreatePmProjectStatusPayload, UpdatePmProjectStatusPayload,
} from '../types/pmProjectStatus.types';

const ACTIVE_KEY = ['pm', 'project-statuses'] as const;
const MANAGE_KEY = ['pm', 'project-statuses', 'manage'] as const;

function invalidateLookups(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ACTIVE_KEY });
  qc.invalidateQueries({ queryKey: MANAGE_KEY });
  qc.invalidateQueries({ queryKey: ['pm-project-lookups', 'statuses'] });
  qc.invalidateQueries({ queryKey: ['create-project', 'pm', 'statuses'] });
  qc.invalidateQueries({ queryKey: ['pm-dashboard'] });
}

/** Active catalog — dropdowns, filters, create form (any authenticated user). */
export function usePmProjectStatuses() {
  return useQuery({
    queryKey: ACTIVE_KEY,
    queryFn:  () => pmProjectStatusApi.listActive(),
    staleTime: Infinity,
  });
}

/** Full catalog for CRUD admin (project-manager / super-admin). */
export function usePmProjectStatusesManage() {
  return useQuery({
    queryKey: MANAGE_KEY,
    queryFn:  () => pmProjectStatusApi.listManage().then((r) => toApiArray<ApiPmProjectStatus>(r.data.data)),
  });
}

/** @deprecated Use usePmProjectStatusesManage */
export const usePmProjectStatusList = usePmProjectStatusesManage;

export function useCreatePmProjectStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePmProjectStatusPayload) => pmProjectStatusApi.create(payload),
    onSuccess:  () => invalidateLookups(qc),
  });
}

export function useUpdatePmProjectStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePmProjectStatusPayload }) =>
      pmProjectStatusApi.update(id, payload),
    onSuccess: (r) => {
      qc.setQueryData(MANAGE_KEY, toApiArray<ApiPmProjectStatus>(r.data.data));
      invalidateLookups(qc);
    },
  });
}

export function useDeletePmProjectStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pmProjectStatusApi.remove(id),
    onSuccess: (r) => {
      qc.setQueryData(MANAGE_KEY, toApiArray<ApiPmProjectStatus>(r.data.data));
      invalidateLookups(qc);
    },
  });
}
