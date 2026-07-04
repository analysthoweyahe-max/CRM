import { http } from '@/shared/services/http.service';
import type { SeoTaskListResponse } from '../types/seoTask.types';

export const seoTaskApi = {
  list(projectUuid: string, params?: { status?: string; search?: string }) {
    return http.get<SeoTaskListResponse>(`/v1/seo/projects/${projectUuid}/tasks`, { params });
  },
};
