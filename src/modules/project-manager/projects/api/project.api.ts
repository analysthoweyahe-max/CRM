import { http } from '@/shared/services/http.service';
import type {
  PmProjectListApiResponse,
  PmProjectDetailsApiResponse,
  PmProjectApiResponse,
  PmLookupApiResponse,
  PmProjectPayload,
} from '../types/project.types';

export const pmProjectsApi = {
  list(params: { search?: string; status?: string; is_draft?: boolean; per_page?: number; page?: number }) {
    return http.get<PmProjectListApiResponse>('/v1/pm/projects', { params });
  },

  create(payload: PmProjectPayload) {
    return http.post<PmProjectApiResponse>('/v1/pm/projects', payload);
  },

  get(id: number | string) {
    return http.get<PmProjectDetailsApiResponse>(`/v1/pm/projects/${id}`);
  },

  getSettings(id: number | string) {
    return http.get<PmProjectApiResponse>(`/v1/pm/projects/${id}/settings`);
  },

  update(id: number | string, payload: PmProjectPayload) {
    return http.put<PmProjectDetailsApiResponse>(`/v1/pm/projects/${id}`, payload);
  },

  updateStatus(id: number | string, status: string) {
    return http.patch<PmProjectApiResponse>(`/v1/pm/projects/${id}/status`, { status });
  },

  remove(id: number | string) {
    return http.delete<{ status: string; message: string }>(`/v1/pm/projects/${id}`);
  },
};

export const pmProjectLookupsApi = {
  statuses() {
    return http.get<PmLookupApiResponse>('/v1/pm/projects/lookups/statuses');
  },
  types() {
    return http.get<PmLookupApiResponse>('/v1/pm/projects/lookups/types');
  },
  taskStatuses() {
    return http.get<PmLookupApiResponse>('/v1/pm/projects/lookups/task-statuses');
  },
  taskPriorities() {
    return http.get<PmLookupApiResponse>('/v1/pm/projects/lookups/task-priorities');
  },
};
