import { http } from '@/shared/services/http.service';
import type { EmpDashboardApiResponse } from '../types/dashboard.types';

export const empDashboardApi = {
  get() {
    return http.get<EmpDashboardApiResponse>('/v1/pm/dashboard');
  },
};
