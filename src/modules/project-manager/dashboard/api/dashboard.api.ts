import { http } from '@/shared/services/http.service';
import type { PmDashboardApiResponse } from '../types/dashboard.types';

export const pmDashboardApi = {
  get() {
    return http.get<PmDashboardApiResponse>('/v1/pm/manager/dashboard');
  },
};
