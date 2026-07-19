import { http } from '@/shared/services/http.service';
import type { ApiResponse } from '@/shared/types/api.types';
import type { PaginatedProjects, SeoLeaderDashboardData } from '../types/dashboard.types';

export const seoLeaderDashboardApi = {
  /** SEO leader / manager home — projects with progress from dashboard payload. */
  get() {
    return http.get<ApiResponse<SeoLeaderDashboardData>>('/v1/seo/manager/dashboard');
  },

  /** Paginated project list (admin dashboard counts, etc.). */
  getProjects() {
    return http.get<ApiResponse<PaginatedProjects>>('/v1/seo/projects');
  },
};
