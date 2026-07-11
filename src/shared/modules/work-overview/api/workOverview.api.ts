import { http } from '@/shared/services/http.service';
import type {
  PersonalBonusDetailResponse,
  PersonalBonusListParams,
  PersonalBonusListResponse,
  PersonalDeductionDetailResponse,
  PersonalDeductionListParams,
  PersonalDeductionListResponse,
  WorkOverviewResponse,
  WorkScope,
} from '../types/workOverview.types';
import {
  personalBonusPath,
  personalBonusesPath,
  personalDeductionPath,
  personalDeductionsPath,
  workOverviewPath,
} from '../utils/workOverview.utils';

function cleanParams(params: Record<string, string | number | undefined>) {
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') out[k] = v;
  }
  return out;
}

export const workOverviewApi = {
  overview(scope: WorkScope, month: string) {
    return http.get<WorkOverviewResponse>(workOverviewPath(scope), {
      params: { month },
    });
  },

  deductions(scope: WorkScope, params: PersonalDeductionListParams = {}) {
    return http.get<PersonalDeductionListResponse>(personalDeductionsPath(scope), {
      params: cleanParams({
        financial_month: params.financial_month,
        status:          params.status,
        per_page:        params.per_page,
        page:            params.page,
      }),
    });
  },

  deduction(scope: WorkScope, id: string) {
    return http.get<PersonalDeductionDetailResponse>(personalDeductionPath(scope, id));
  },

  bonuses(scope: WorkScope, params: PersonalBonusListParams = {}) {
    return http.get<PersonalBonusListResponse>(personalBonusesPath(scope), {
      params: cleanParams({
        financial_month: params.financial_month,
        adjustment_type: params.adjustment_type,
        date_from:       params.date_from,
        date_to:         params.date_to,
        per_page:        params.per_page,
        page:            params.page,
      }),
    });
  },

  bonus(scope: WorkScope, id: string) {
    return http.get<PersonalBonusDetailResponse>(personalBonusPath(scope, id));
  },
};
