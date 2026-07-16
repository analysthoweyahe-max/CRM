import { http }             from '@/shared/services/http.service';
import type { ApiResponse }  from '@/shared/types/api.types';
import type { PaginatedProjects } from '../types/dashboard.types';

export interface SeoProjectsListParams {
  status?:   string;
  per_page?: number;
  page?:     number;
  is_draft?: 0 | 1;
}

export const seoLeaderDashboardApi = {
  getProjects(params?: SeoProjectsListParams) {
    return http.get<ApiResponse<PaginatedProjects>>('/v1/seo/projects', { params });
  },
};
