import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empLeaveApi } from '../api/employeeLeave.api';
import type {
  EmpLeaveRequest,
  EmpLeaveType,
  EmpLeaveSummaryData,
  EmpLeaveSummaryItem,
  EmpLeaveCreatePayload,
} from '../types/employeeLeave.types';

const KEYS = {
  summary: ['employee', 'leave', 'summary'] as const,
  types:   ['employee', 'leave', 'types']   as const,
  list:    ['employee', 'leave', 'list']    as const,
};

function selectSummary(res: Awaited<ReturnType<typeof empLeaveApi.summary>>): EmpLeaveSummaryData {
  const data = res.data.data;
  return {
    balances:            data?.balances ?? [],
    requests:            data?.requests ?? [],
    viewFullHistoryUrl:  data?.viewFullHistoryUrl,
  };
}

/** Full summary: balances + recent requests from GET /v1/employee/leave/summary */
export function useEmpLeaveSummary() {
  return useQuery({
    queryKey: KEYS.summary,
    queryFn:  () => empLeaveApi.summary(),
    select:   selectSummary,
    staleTime: 60_000,
  });
}

/** Balance rows only — for dashboards that only need the progress bars */
export function useEmpLeaveBalances() {
  return useQuery({
    queryKey: KEYS.summary,
    queryFn:  () => empLeaveApi.summary(),
    select:   (res): EmpLeaveSummaryItem[] => selectSummary(res).balances,
    staleTime: 60_000,
  });
}

export function useEmpLeaveTypes() {
  return useQuery({
    queryKey: KEYS.types,
    queryFn:  () => empLeaveApi.types(),
    select:   res => (res.data.data ?? []) as EmpLeaveType[],
  });
}

/** Paginated full history — use when summary.requests is not enough */
export function useEmpLeaveList() {
  return useQuery({
    queryKey: KEYS.list,
    queryFn:  () => empLeaveApi.list(),
    select:   res => (res.data.data?.data ?? []) as EmpLeaveRequest[],
  });
}

export function useEmpLeaveCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: EmpLeaveCreatePayload) => empLeaveApi.create(payload),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEYS.list });
      qc.invalidateQueries({ queryKey: KEYS.summary });
    },
  });
}
