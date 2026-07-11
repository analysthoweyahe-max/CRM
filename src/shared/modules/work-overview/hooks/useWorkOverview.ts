import { useQuery } from '@tanstack/react-query';
import { workOverviewApi } from '../api/workOverview.api';
import type {
  PersonalBonusListParams,
  PersonalDeductionListParams,
  WorkScope,
} from '../types/workOverview.types';
import { extractApiError, extractApiStatus } from '@/shared/utils/error.utils';

export function useWorkOverview(scope: WorkScope, month: string) {
  return useQuery({
    queryKey: ['work-overview', scope, month],
    queryFn:  () => workOverviewApi.overview(scope, month).then(r => r.data.data),
    staleTime: 60_000,
    retry: (count, err) => extractApiStatus(err) === 422 ? false : count < 2,
  });
}

export function usePersonalDeductions(scope: WorkScope, params: PersonalDeductionListParams) {
  return useQuery({
    queryKey: ['personal-deductions', scope, params],
    queryFn:  () => workOverviewApi.deductions(scope, params).then(r => r.data.data),
    staleTime: 60_000,
    retry: (count, err) => extractApiStatus(err) === 422 ? false : count < 2,
  });
}

export function usePersonalDeduction(scope: WorkScope, id: string) {
  return useQuery({
    queryKey: ['personal-deduction', scope, id],
    queryFn:  () => workOverviewApi.deduction(scope, id).then(r => r.data.data),
    enabled:  Boolean(id),
    staleTime: 60_000,
    retry: (count, err) => extractApiStatus(err) === 422 ? false : count < 2,
  });
}

export function usePersonalBonuses(scope: WorkScope, params: PersonalBonusListParams) {
  return useQuery({
    queryKey: ['personal-bonuses', scope, params],
    queryFn:  () => workOverviewApi.bonuses(scope, params).then(r => r.data.data),
    staleTime: 60_000,
    retry: (count, err) => extractApiStatus(err) === 422 ? false : count < 2,
  });
}

export function usePersonalBonus(scope: WorkScope, id: string) {
  return useQuery({
    queryKey: ['personal-bonus', scope, id],
    queryFn:  () => workOverviewApi.bonus(scope, id).then(r => r.data.data),
    enabled:  Boolean(id),
    staleTime: 60_000,
    retry: (count, err) => extractApiStatus(err) === 422 ? false : count < 2,
  });
}

export function useApiQueryError(error: unknown): { status?: number; message: string } | null {
  if (!error) return null;
  return {
    status:  extractApiStatus(error),
    message: extractApiError(error),
  };
}
