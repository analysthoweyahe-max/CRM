import { http } from '@/shared/services/http.service';
import { toActiveProjectStatusLookups, unwrapProjectStatusArray } from '@/shared/utils/projectStatusLookups.utils';
import type { StatusLookupItem } from '@/shared/modules/my-projects/types/myProjects.types';
import type {
  SeoProjectStatusListResponse,
  SeoProjectStatusSingleResponse,
  CreateSeoProjectStatusPayload,
  UpdateSeoProjectStatusPayload,
  UpdateSeoProjectStatusResponse,
  DeleteSeoProjectStatusResponse,
} from '../types/seoProjectStatus.types';

export const seoProjectStatusApi = {
  /** Active statuses for all authenticated users (dropdowns, filters, badges). */
  listActive(): Promise<StatusLookupItem[]> {
    return http.get<SeoProjectStatusListResponse>('/v1/seo/project-statuses')
      .then(r => toActiveProjectStatusLookups(unwrapProjectStatusArray(r.data.data)));
  },

  /** Management list — `?manage=1` returns inactive/default flags for CRUD. */
  listManage() {
    return http.get<SeoProjectStatusListResponse>('/v1/seo/project-statuses', {
      params: { manage: 1 },
    });
  },

  get(id: number | string) {
    return http.get<SeoProjectStatusSingleResponse>(`/v1/seo/project-statuses/${id}`);
  },

  create(payload: CreateSeoProjectStatusPayload) {
    return http.post<SeoProjectStatusSingleResponse>('/v1/seo/project-statuses', payload);
  },

  update(id: number | string, payload: UpdateSeoProjectStatusPayload) {
    return http.put<UpdateSeoProjectStatusResponse>(`/v1/seo/project-statuses/${id}`, payload);
  },

  remove(id: number | string) {
    return http.delete<DeleteSeoProjectStatusResponse>(`/v1/seo/project-statuses/${id}`);
  },
};
