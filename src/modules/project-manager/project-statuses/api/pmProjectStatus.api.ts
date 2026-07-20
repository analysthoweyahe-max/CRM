import { http } from '@/shared/services/http.service';
import { toActiveProjectStatusLookups, unwrapProjectStatusArray } from '@/shared/utils/projectStatusLookups.utils';
import type { StatusLookupItem } from '@/shared/modules/my-projects/types/myProjects.types';
import type {
  PmProjectStatusListResponse,
  PmProjectStatusSingleResponse,
  CreatePmProjectStatusPayload,
  UpdatePmProjectStatusPayload,
  UpdatePmProjectStatusResponse,
  DeletePmProjectStatusResponse,
} from '../types/pmProjectStatus.types';

export const pmProjectStatusApi = {
  /** Active statuses for all authenticated users (dropdowns, filters, badges). */
  listActive(): Promise<StatusLookupItem[]> {
    return http.get<PmProjectStatusListResponse>('/v1/pm/project-statuses')
      .then(r => toActiveProjectStatusLookups(unwrapProjectStatusArray(r.data.data)));
  },

  /** Management list — `?manage=1` returns inactive/default flags for CRUD. */
  listManage() {
    return http.get<PmProjectStatusListResponse>('/v1/pm/project-statuses', {
      params: { manage: 1 },
    });
  },

  get(id: number | string) {
    return http.get<PmProjectStatusSingleResponse>(`/v1/pm/project-statuses/${id}`);
  },

  create(payload: CreatePmProjectStatusPayload) {
    return http.post<PmProjectStatusSingleResponse>('/v1/pm/project-statuses', payload);
  },

  update(id: number | string, payload: UpdatePmProjectStatusPayload) {
    return http.put<UpdatePmProjectStatusResponse>(`/v1/pm/project-statuses/${id}`, payload);
  },

  remove(id: number | string) {
    return http.delete<DeletePmProjectStatusResponse>(`/v1/pm/project-statuses/${id}`);
  },
};
