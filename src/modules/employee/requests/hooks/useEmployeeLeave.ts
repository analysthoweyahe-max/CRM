import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empLeaveApi } from '../api/employeeLeave.api';
import type {
  EmpLeaveRequest,
  EmpLeaveType,
  EmpLeaveSummaryItem,
  EmpLeaveCreatePayload,
} from '../types/employeeLeave.types';

const KEYS = {
  summary: ['employee', 'leave', 'summary'] as const,
  types:   ['employee', 'leave', 'types']   as const,
  list:    ['employee', 'leave', 'list']    as const,
};

export function useEmpLeaveSummary() {
  return useQuery({
    queryKey: KEYS.summary,
    queryFn:  () => empLeaveApi.summary(),
    select:   res => res.data.data.balances as EmpLeaveSummaryItem[],
  });
}

export function useEmpLeaveTypes() {
  return useQuery({
    queryKey: KEYS.types,
    queryFn:  () => empLeaveApi.types(),
    select:   res => (res.data.data ?? []) as EmpLeaveType[],
  });
}

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
