import { http } from '@/shared/services/http.service';
import type {
  SeoLeaveTypesResponse,
  SeoLeaveSummaryResponse,
  SeoLeaveHistoryResponse,
  SeoLeaveCreateResponse,
} from '../types/seoLeave.types';

export const seoLeaveApi = {
  types() {
    return http.get<SeoLeaveTypesResponse>('/v1/seo/leave/lookups/types');
  },

  summary() {
    return http.get<SeoLeaveSummaryResponse>('/v1/seo/leave/summary');
  },

  history(params?: { per_page?: number; page?: number }) {
    return http.get<SeoLeaveHistoryResponse>('/v1/seo/leave/history', { params });
  },

  create(payload: FormData | Record<string, string>) {
    return http.post<SeoLeaveCreateResponse>('/v1/seo/leave', payload);
  },

  cancel(id: string) {
    return http.post<{ status: string; message: string }>(`/v1/seo/leave/${id}/cancel`);
  },
};
