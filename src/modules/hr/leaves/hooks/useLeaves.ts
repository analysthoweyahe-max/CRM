import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLang } from '@/app/providers/LanguageProvider';
import { leavesApi } from '../api/leaves.api';
import { normalizeLeaveRequest } from '../utils/leave.utils';
import type { LeaveListParams, EmployeeLeaveHistoryParams } from '../types/leaves.types';


export function useLeaveList(params?: LeaveListParams) {
  return useQuery({
    queryKey: ['leaves', 'list', params],
    queryFn:  () => leavesApi.list(params).then((r) => r.data.data),
  });
}

export function useLeaveDetail(id: string | undefined) {
  const { lang } = useLang();
  const isAr = lang === 'ar';

  return useQuery({
    queryKey: ['leaves', 'detail', id, isAr],
    queryFn:  () => leavesApi.show(id!).then((r) => normalizeLeaveRequest(r.data.data, isAr)),
    enabled:  !!id,
  });
}

export function useLeaveTypes() {
  return useQuery({
    queryKey: ['leaves', 'types'],
    queryFn:  () => leavesApi.leaveTypes().then((r) => r.data.data),
    staleTime: 10 * 60 * 1000,
  });
}

export function useLeaveApprove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      leavesApi.approve(id, notes).then((r) => r.data.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['leaves'] });
      qc.invalidateQueries({ queryKey: ['leaves', 'detail', id] });
    },
  });
}

export function useLeaveReject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      leavesApi.reject(id, reason).then((r) => r.data.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['leaves'] });
      qc.invalidateQueries({ queryKey: ['leaves', 'detail', id] });
    },
  });
}

export function useEmployeeLeaveSummary(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['leaves', 'summary', employeeId],
    queryFn:  () => leavesApi.employeeSummary(employeeId!).then((r) => r.data.data),
    enabled:  !!employeeId,
  });
}

export function useEmployeeLeaveHistory(
  employeeId: string | undefined,
  params?: EmployeeLeaveHistoryParams,
) {
  return useQuery({
    queryKey: ['leaves', 'history', employeeId, params],
    queryFn:  () => leavesApi.employeeHistory(employeeId!, params).then((r) => r.data.data),
    enabled:  !!employeeId,
  });
}
