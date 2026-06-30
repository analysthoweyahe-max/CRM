import { http }             from '@/shared/services/http.service';
import type { ApiResponse }  from '@/shared/types/api.types';
import type { PaginatedProjects } from '../types/dashboard.types';

export const seoLeaderDashboardApi = {
  getProjects() {
    return http.get<ApiResponse<PaginatedProjects>>('/v1/seo/projects');
  },
};
