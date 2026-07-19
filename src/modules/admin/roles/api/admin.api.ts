import { http } from '@/shared/services/http.service';

import type {
  AssignAdminRolePayload,
  CreateAdminPayload,
  CreateAdminResponse,
  AdminManagerListResponse,
  AdminManagerDetailResponse,
  UpdateAdminPayload,
  UpdateAdminResponse,
  AdminManagerListParams,
  ApiAdminManager,
} from '../types/adminManager.types';
import { normalizeManagerRoleSlugs, resolveAssignableRoleName } from '../utils/role.utils';

function asLookup(value: unknown): ApiAdminManager['department'] {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  if (record.id == null) return null;
  return value as NonNullable<ApiAdminManager['department']>;
}

function asLookupList(value: unknown): NonNullable<ApiAdminManager['departments']> {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asLookup(item))
    .filter((item): item is NonNullable<ApiAdminManager['department']> => item != null);
}

/** Normalize list/detail payloads so edit forms can always read camelCase lookups. */
export function normalizeManager(raw: ApiAdminManager): ApiAdminManager {
  const record = raw as ApiAdminManager & {
    job_title?: ApiAdminManager['jobTitle'];
    job_title_id?: number | string | null;
    department_ids?: Array<number | string> | null;
  };
  const roles = normalizeManagerRoleSlugs(raw.roles);

  const departments = asLookupList(raw.departments);
  const department = asLookup(raw.department)
    ?? (departments[0] ?? null);

  const jobTitle = asLookup(raw.jobTitle)
    ?? asLookup(record.job_title)
    ?? (record.job_title_id != null
      ? { id: record.job_title_id, name: String(record.job_title_id) }
      : null);

  // Prefer nested departments; fall back to bare ids from older payloads.
  const departmentsFromIds = !departments.length && record.department_ids?.length
    ? record.department_ids.map((id) => ({ id, name: String(id) }))
    : departments;

  return {
    ...raw,
    roles: roles.length > 0 ? roles : (Array.isArray(raw.roles)
      ? raw.roles.filter((r): r is string => typeof r === 'string')
      : []),
    department,
    departments: departmentsFromIds.length ? departmentsFromIds : (department ? [department] : []),
    jobTitle,
  };
}

/** Ensure `role` is always an English slug before hitting the API. */
function sanitizeRolePayload<T extends { role?: string }>(payload: T): T {
  if (payload.role == null) return payload;
  const slug = resolveAssignableRoleName(payload.role);
  if (!slug) {
    const { role: _omit, ...rest } = payload;
    return rest as T;
  }
  return { ...payload, role: slug };
}

export const adminApi = {
  list(params: AdminManagerListParams = {}) {
    return http.get<AdminManagerListResponse>('/v1/admins', { params }).then((res) => {
      const page = res.data.data;
      if (page?.data) {
        page.data = page.data.map(normalizeManager);
      }
      return res;
    });
  },

  get(id: string) {
    return http.get<AdminManagerDetailResponse>(`/v1/admins/${id}`).then((res) => {
      if (res.data.data) {
        res.data.data = normalizeManager(res.data.data);
      }
      return res;
    });
  },

  create(payload: CreateAdminPayload) {
    return http.post<CreateAdminResponse>('/v1/admins', sanitizeRolePayload(payload)).then((res) => {
      if (res.data.data) {
        res.data.data = normalizeManager(res.data.data);
      }
      return res;
    });
  },

  update(id: string, payload: UpdateAdminPayload) {
    return http.put<UpdateAdminResponse>(`/v1/admins/${id}`, sanitizeRolePayload(payload)).then((res) => {
      if (res.data.data) {
        res.data.data = normalizeManager(res.data.data);
      }
      return res;
    });
  },

  remove(id: string) {
    return http.delete<{ status: string; message: string }>(`/v1/admins/${id}`);
  },

  /** @deprecated Use update() — backend assigns role via PUT /v1/admins/{uuid}. */
  assignRole(id: string, payload: AssignAdminRolePayload) {
    return this.update(id, payload);
  },
};
