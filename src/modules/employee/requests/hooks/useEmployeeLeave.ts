import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empLeaveApi } from '../api/employeeLeave.api';
import type { EmpLeaveRequest, EmpLeaveType, EmpLeaveSummaryItem } from '../types/employeeLeave.types';

const KEYS = {
  summary: ['employee', 'leave', 'summary'] as const,
  types:   ['employee', 'leave', 'types']   as const,
  list:    ['employee', 'leave', 'list']    as const,
};

export function useEmpLeaveSummary() {
  return useQuery({
    queryKey: KEYS.summary,
    queryFn:  () => empLeaveApi.summary(),
    select:   res => {
      const raw = res.data.data;
      if (Array.isArray(raw)) return raw as EmpLeaveSummaryItem[];
      return Object.entries(raw as Record<string, unknown>).map(([key, val]) => {
        const v = val as Record<string, unknown>;
        return {
          type:      key,
          label:     (v.label ?? v.name ?? key) as string,
          balance:   (v.total ?? v.balance ?? 0) as number,
          used:      (v.used ?? 0) as number,
          remaining: (v.remaining ?? 0) as number,
        } satisfies EmpLeaveSummaryItem;
      });
    },
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
    mutationFn: (fd: FormData) => empLeaveApi.create(fd),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEYS.list });
      qc.invalidateQueries({ queryKey: KEYS.summary });
    },
  });
}
