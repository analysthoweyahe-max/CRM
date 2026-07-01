import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seoLeaveApi } from '../api/seoLeave.api';
import type { SeoLeaveType, SeoLeaveRequest, SeoLeaveBalance } from '../types/seoLeave.types';
import type { EmpLeaveSummaryItem } from '@/modules/employee/requests/types/employeeLeave.types';

const KEYS = {
  types:   ['seo-member', 'leave', 'types']   as const,
  summary: ['seo-member', 'leave', 'summary'] as const,
  history: ['seo-member', 'leave', 'history'] as const,
};

export function useSeoLeaveTypes() {
  return useQuery({
    queryKey: KEYS.types,
    queryFn:  () => seoLeaveApi.types(),
    select:   res => (res.data.data ?? []) as SeoLeaveType[],
    staleTime: 300_000,
  });
}

export function useSeoLeaveSummary() {
  return useQuery({
    queryKey: KEYS.summary,
    queryFn:  () => seoLeaveApi.summary(),
    select:   res => {
      const balances: SeoLeaveBalance[] = res.data.data?.balances ?? [];
      return balances.map((b): EmpLeaveSummaryItem => ({
        type:      b.leaveType,
        label:     b.leaveTypeLabel,
        total:     b.entitled,
        used:      b.used,
        remaining: b.remaining,
      }));
    },
    staleTime: 60_000,
  });
}

export function useSeoLeaveHistory() {
  return useQuery({
    queryKey: KEYS.history,
    queryFn:  () => seoLeaveApi.history({ per_page: 15 }),
    select:   res => (res.data.data?.data ?? []) as SeoLeaveRequest[],
    staleTime: 30_000,
  });
}

export function useSeoLeaveCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData | Record<string, string>) => seoLeaveApi.create(payload),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEYS.history });
      qc.invalidateQueries({ queryKey: KEYS.summary });
    },
  });
}

export function useSeoLeaveCancel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => seoLeaveApi.cancel(id),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: KEYS.history });
      qc.invalidateQueries({ queryKey: KEYS.summary });
    },
  });
}
