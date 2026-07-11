import { http } from '@/shared/services/http.service';
import type { CreateProjectModule } from '@/shared/modules/create-project/types/createProject.types';
import type {
  PmTemplateListApiResponse,
  PmTemplateListAllApiResponse,
  PmTemplateApiResponse,
  PmTemplatePayload,
  PmApplyTemplatePayload,
} from '../types/template.types';
import type { PmProjectDetailsApiResponse } from '@/modules/project-manager/projects/types/project.types';

export type TemplateModule = CreateProjectModule;

function basePath(module: TemplateModule): string {
  return module === 'seo' ? '/v1/seo' : '/v1/pm';
}

export function projectTemplatesApi(module: TemplateModule = 'pm') {
  const base = `${basePath(module)}/project-templates`;
  const projectsBase = `${basePath(module)}/projects`;

  return {
    list(params: { search?: string; per_page?: number; page?: number } = {}) {
      return http.get<PmTemplateListApiResponse>(base, { params });
    },

    /** Full list without pagination — for select/dropdown components. */
    all() {
      return http.get<PmTemplateListAllApiResponse>(`${base}/all`);
    },

    get(uuid: string) {
      return http.get<PmTemplateApiResponse>(`${base}/${uuid}`);
    },

    create(payload: PmTemplatePayload) {
      return http.post<PmTemplateApiResponse>(base, payload);
    },

    update(uuid: string, payload: PmTemplatePayload) {
      return http.put<PmTemplateApiResponse>(`${base}/${uuid}`, payload);
    },

    remove(uuid: string) {
      return http.delete<{ status: number | string; message: string }>(`${base}/${uuid}`);
    },

    /** Apply a template's steps as phases onto an existing project. */
    apply(projectUuid: string, payload: PmApplyTemplatePayload) {
      return http.post<PmProjectDetailsApiResponse>(
        `${projectsBase}/${projectUuid}/apply-template`,
        payload,
      );
    },
  };
}

/** @deprecated Prefer `projectTemplatesApi('pm')` */
export const pmProjectTemplatesApi = projectTemplatesApi('pm');
