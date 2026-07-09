import { http } from '@/shared/services/http.service';
import type {
  PmTemplateListApiResponse,
  PmTemplateListAllApiResponse,
  PmTemplateApiResponse,
  PmTemplatePayload,
  PmApplyTemplatePayload,
} from '../types/template.types';
import type { PmProjectDetailsApiResponse } from '@/modules/project-manager/projects/types/project.types';

export const pmProjectTemplatesApi = {
  list(params: { search?: string; per_page?: number; page?: number } = {}) {
    return http.get<PmTemplateListApiResponse>('/v1/pm/project-templates', { params });
  },

  /** Full list without pagination — for select/dropdown components. */
  all() {
    return http.get<PmTemplateListAllApiResponse>('/v1/pm/project-templates/all');
  },

  get(uuid: string) {
    return http.get<PmTemplateApiResponse>(`/v1/pm/project-templates/${uuid}`);
  },

  create(payload: PmTemplatePayload) {
    return http.post<PmTemplateApiResponse>('/v1/pm/project-templates', payload);
  },

  update(uuid: string, payload: PmTemplatePayload) {
    return http.put<PmTemplateApiResponse>(`/v1/pm/project-templates/${uuid}`, payload);
  },

  remove(uuid: string) {
    return http.delete<{ status: number | string; message: string }>(`/v1/pm/project-templates/${uuid}`);
  },

  /** Apply a template's steps as phases onto an existing project. */
  apply(projectUuid: string, payload: PmApplyTemplatePayload) {
    return http.post<PmProjectDetailsApiResponse>(`/v1/pm/projects/${projectUuid}/apply-template`, payload);
  },
};
