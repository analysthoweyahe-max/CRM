import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seoLeaveApi } from '../api/seoLeave.api';
import type {
  SeoLeaveType,
  SeoLeaveRequest,
  SeoLeaveBalance,
  SeoLeaveSummary,
} from '../types/seoLeave.types';
import type { EmpLeaveSummaryItem } from '@/modules/employee/requests/types/employeeLeave.types';

const KEYS = {
  types:   ['seo-member', 'leave', 'types']   as const,
  summary: ['seo-member', 'leave', 'summary'] as const,
  history: ['seo-member', 'leave', 'history'] as const,
};

function selectSummary(res: Awaited<ReturnType<typeof seoLeaveApi.summary>>): SeoLeaveSummary {
  const data = res.data.data;
  return {
    balances:           data?.balances ?? [],
    requests:           data?.requests ?? [],
    viewFullHistoryUrl: data?.viewFullHistoryUrl ?? '',
  };
}

function toBalanceItems(balances: SeoLeaveBalance[]): EmpLeaveSummaryItem[] {
  return balances.map((b) => ({
    leaveType:      b.leaveType,
    leaveTypeLabel: b.leaveTypeLabel,
    entitled:       b.entitled,
    used:           b.used,
    remaining:      b.remaining,
  }));
}

export function useSeoLeaveTypes() {
  return useQuery({
    queryKey: KEYS.types,
    queryFn:  () => seoLeaveApi.types(),
    select:   res => (res.data.data ?? []) as SeoLeaveType[],
    staleTime: 300_000,
  });
}

/** Full summary: balances + recent requests from GET /v1/seo/leave/summary */
export function useSeoLeaveSummary() {
  return useQuery({
    queryKey: KEYS.summary,
    queryFn:  () => seoLeaveApi.summary(),
    select:   selectSummary,
    staleTime: 60_000,
  });
}

/** Balance rows only — for LeaveBalancePanel */
export function useSeoLeaveBalances() {
  return useQuery({
    queryKey: KEYS.summary,
    queryFn:  () => seoLeaveApi.summary(),
    select:   (res): EmpLeaveSummaryItem[] => toBalanceItems(selectSummary(res).balances),
    staleTime: 60_000,
  });
}

/** Paginated full history — use when summary.requests is not enough */
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
