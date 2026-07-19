import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { extractApiError } from '@/shared/utils/error.utils';
import { adminRequestsApiFor } from '../api/adminRequest.api';
import type {
  AdminRequestCreatePayload,
  AdminRequestListParams,
  AdminRequestNamespace,
} from '../types/adminRequest.types';

function keys(ns: AdminRequestNamespace) {
  return {
    all:   ['admin-requests', ns] as const,
    list:  (params?: AdminRequestListParams) => ['admin-requests', ns, 'list', params] as const,
    types: ['admin-requests', ns, 'types'] as const,
    show:  (id: string) => ['admin-requests', ns, 'show', id] as const,
  };
}

export function useAdminRequestTypes(ns: AdminRequestNamespace) {
  const api = adminRequestsApiFor(ns);
  return useQuery({
    queryKey: keys(ns).types,
    queryFn:  () => api.types().then((r) => r.data.data ?? []),
    staleTime: 5 * 60_000,
  });
}

export function useAdminRequestList(
  ns: AdminRequestNamespace,
  params?: AdminRequestListParams,
  enabled = true,
) {
  const api = adminRequestsApiFor(ns);
  return useQuery({
    queryKey: keys(ns).list(params),
    queryFn:  () => api.list(params).then((r) => r.data.data),
    staleTime: 30_000,
    enabled,
  });
}

export function useCreateAdminRequest(ns: AdminRequestNamespace, isAr: boolean) {
  const api = adminRequestsApiFor(ns);
  const qc  = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminRequestCreatePayload) => api.create(payload).then((r) => r.data.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys(ns).all });
      toast.success(isAr ? 'تم تقديم الطلب بنجاح' : 'Request submitted successfully');
    },
    onError: (err) => toast.error(extractApiError(err) || (isAr ? 'تعذّر تقديم الطلب' : 'Failed to submit request')),
  });
}

export function useCancelAdminRequest(ns: AdminRequestNamespace, isAr: boolean) {
  const api = adminRequestsApiFor(ns);
  const qc  = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.cancel(id).then((r) => r.data.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys(ns).all });
      toast.success(isAr ? 'تم إلغاء الطلب' : 'Request cancelled');
    },
    onError: (err) => toast.error(extractApiError(err) || (isAr ? 'تعذّر إلغاء الطلب' : 'Failed to cancel request')),
  });
}

export function useApproveAdminRequest(ns: AdminRequestNamespace, isAr: boolean) {
  const api = adminRequestsApiFor(ns);
  const qc  = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      api.approve(id, comment).then((r) => r.data.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys(ns).all });
      toast.success(isAr ? 'تمت الموافقة على الطلب' : 'Request approved');
    },
    onError: (err) => toast.error(extractApiError(err) || (isAr ? 'تعذّرت الموافقة' : 'Failed to approve')),
  });
}

export function useRejectAdminRequest(ns: AdminRequestNamespace, isAr: boolean) {
  const api = adminRequestsApiFor(ns);
  const qc  = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      api.reject(id, comment).then((r) => r.data.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: keys(ns).all });
      toast.success(isAr ? 'تم رفض الطلب' : 'Request rejected');
    },
    onError: (err) => toast.error(extractApiError(err) || (isAr ? 'تعذّر الرفض' : 'Failed to reject')),
  });
}
