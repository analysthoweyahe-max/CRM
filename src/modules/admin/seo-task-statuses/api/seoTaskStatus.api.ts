import { http } from '@/shared/services/http.service';
import type {
  SeoTaskStatusListResponse,
  SeoTaskStatusSingleResponse,
  CreateSeoTaskStatusPayload,
  UpdateSeoTaskStatusPayload,
  UpdateSeoTaskStatusResponse,
  DeleteSeoTaskStatusResponse,
} from '../types/seoTaskStatus.types';

export const seoTaskStatusApi = {
  list() {
    return http.get<SeoTaskStatusListResponse>('/v1/seo/task-statuses');
  },

  get(id: number | string) {
    return http.get<SeoTaskStatusSingleResponse>(`/v1/seo/task-statuses/${id}`);
  },

  create(payload: CreateSeoTaskStatusPayload) {
    return http.post<SeoTaskStatusSingleResponse>('/v1/seo/task-statuses', payload);
  },

  update(id: number | string, payload: UpdateSeoTaskStatusPayload) {
    return http.put<UpdateSeoTaskStatusResponse>(`/v1/seo/task-statuses/${id}`, payload);
  },

  remove(id: number | string) {
    return http.delete<DeleteSeoTaskStatusResponse>(`/v1/seo/task-statuses/${id}`);
  },
};
