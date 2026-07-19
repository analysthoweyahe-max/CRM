import { http } from '@/shared/services/http.service';
import type {
  PmTaskStatusListResponse,
  PmTaskStatusSingleResponse,
  CreatePmTaskStatusPayload,
  UpdatePmTaskStatusPayload,
  UpdatePmTaskStatusResponse,
  DeletePmTaskStatusResponse,
} from '../types/pmTaskStatus.types';

export const pmTaskStatusApi = {
  /** Management list — `?manage=1` returns inactive/default flags for CRUD. */
  list() {
    return http.get<PmTaskStatusListResponse>('/v1/pm/task-statuses', {
      params: { manage: 1 },
    });
  },

  get(id: number | string) {
    return http.get<PmTaskStatusSingleResponse>(`/v1/pm/task-statuses/${id}`);
  },

  create(payload: CreatePmTaskStatusPayload) {
    return http.post<PmTaskStatusSingleResponse>('/v1/pm/task-statuses', payload);
  },

  update(id: number | string, payload: UpdatePmTaskStatusPayload) {
    return http.put<UpdatePmTaskStatusResponse>(`/v1/pm/task-statuses/${id}`, payload);
  },

  remove(id: number | string) {
    return http.delete<DeletePmTaskStatusResponse>(`/v1/pm/task-statuses/${id}`);
  },
};
