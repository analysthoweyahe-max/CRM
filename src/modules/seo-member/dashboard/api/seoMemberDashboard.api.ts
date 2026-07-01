import { http }            from '@/shared/services/http.service';
import type { ApiResponse } from '@/shared/types/api.types';
import type { SeoMemberDashboardData } from '../types/seoMemberDashboard.types';

export const seoMemberDashboardApi = {
  get() {
    return http.get<ApiResponse<SeoMemberDashboardData>>('/v1/seo/dashboard');
  },
};
