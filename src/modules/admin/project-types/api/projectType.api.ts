import { http } from '@/shared/services/http.service';
import { toApiArray } from '@/shared/utils/apiList.utils';
import { normalizeProjectTypeCategory } from '@/shared/modules/create-project/utils/createProject.utils';
import type {
  PmProjectTypeApiResponse,
  PmProjectTypeItem,
  PmProjectTypeListApiResponse,
  PmProjectTypePayload,
  ProjectTypeCategory,
} from '@/modules/project-manager/projects/types/project.types';

type RawAdminProjectType = Partial<PmProjectTypeItem> & {
  name_ar?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
  department_id?: number | null;
  projects_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  section_label?: string | null;
  category?: string | null;
  section?: string | null;
};

function normalizeAdminProjectType(
  raw: RawAdminProjectType,
  fallback: ProjectTypeCategory,
): PmProjectTypeItem | null {
  const id = Number(raw.id);
  if (!id || Number.isNaN(id)) return null;

  const name = String(raw.name ?? raw.label ?? '').trim();
  if (!name) return null;

  const category = normalizeProjectTypeCategory(raw.category ?? raw.section, fallback);

  return {
    id,
    name,
    nameAr:         raw.nameAr ?? raw.name_ar ?? null,
    slug:           String(raw.slug ?? id),
    label:          raw.label ?? name,
    category,
    section:        raw.section === 'pm' || raw.section === 'seo' ? raw.section : category,
    sectionLabel:   raw.sectionLabel ?? raw.section_label ?? null,
    departmentId:   raw.departmentId ?? raw.department_id ?? raw.department?.id ?? null,
    department:     raw.department ?? null,
    isActive:       (raw.isActive ?? raw.is_active ?? true) !== false,
    sortOrder:      Number(raw.sortOrder ?? raw.sort_order ?? 0),
    projectsCount:  Number(raw.projectsCount ?? raw.projects_count ?? 0),
    createdAt:      raw.createdAt ?? raw.created_at ?? undefined,
    updatedAt:      raw.updatedAt ?? raw.updated_at ?? undefined,
  };
}

function normalizeAdminList(raw: unknown, fallback: ProjectTypeCategory): PmProjectTypeItem[] {
  return toApiArray<RawAdminProjectType>(raw)
    .map((item) => normalizeAdminProjectType(item, fallback))
    .filter((t): t is PmProjectTypeItem => t != null);
}

export const pmAdminProjectTypesApi = {
  list(params?: { department_id?: number }) {
    return http
      .get<PmProjectTypeListApiResponse>('/v1/pm/project-types', { params })
      .then((r) => normalizeAdminList(r.data.data, 'pm'));
  },
  get(id: number) {
    return http
      .get<PmProjectTypeApiResponse>(`/v1/pm/project-types/${id}`)
      .then((r) => normalizeAdminProjectType(r.data.data as RawAdminProjectType, 'pm'));
  },
  create(payload: PmProjectTypePayload) {
    return http.post<PmProjectTypeApiResponse>('/v1/pm/project-types', payload);
  },
  update(id: number, payload: PmProjectTypePayload) {
    return http.post<PmProjectTypeApiResponse>(`/v1/pm/project-types/${id}`, payload);
  },
  remove(id: number) {
    return http.delete<{ status: string; message: string }>(`/v1/pm/project-types/${id}`);
  },
};

export const seoAdminProjectTypesApi = {
  list(params?: { department_id?: number }) {
    return http
      .get<PmProjectTypeListApiResponse>('/v1/seo/project-types', { params })
      .then((r) => normalizeAdminList(r.data.data, 'seo'));
  },
  get(id: number) {
    return http
      .get<PmProjectTypeApiResponse>(`/v1/seo/project-types/${id}`)
      .then((r) => normalizeAdminProjectType(r.data.data as RawAdminProjectType, 'seo'));
  },
  create(payload: PmProjectTypePayload) {
    return http.post<PmProjectTypeApiResponse>('/v1/seo/project-types', payload);
  },
  update(id: number, payload: PmProjectTypePayload) {
    return http.post<PmProjectTypeApiResponse>(`/v1/seo/project-types/${id}`, payload);
  },
  remove(id: number) {
    return http.delete<{ status: string; message: string }>(`/v1/seo/project-types/${id}`);
  },
};

export function projectTypesApiFor(category: ProjectTypeCategory) {
  return category === 'seo' ? seoAdminProjectTypesApi : pmAdminProjectTypesApi;
}
