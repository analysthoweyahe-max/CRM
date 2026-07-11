import { http } from '@/shared/services/http.service';
import { toApiArray } from '@/shared/utils/apiList.utils';
import {
  filterTypesByDepartment,
  normalizeManagers,
  normalizeProjectTypes,
} from '../utils/createProject.utils';
import type {
  CreateProjectModule,
  CreateProjectTypePayload,
  CreatePmProjectPayload,
  CreateSeoProjectPayload,
  DepartmentLookup,
  EmployeeLookup,
  ManagerLookup,
  ProjectType,
  StatusLookup,
} from '../types/createProject.types';

function basePath(module: CreateProjectModule): string {
  return module === 'pm' ? '/v1/pm' : '/v1/seo';
}

const PM_MANAGER_ROLES  = new Set(['project-manager', 'super-admin']);
const SEO_MANAGER_ROLES = new Set(['seo-manager', 'super-admin']);

interface AdminManagerRecord {
  id:    string;
  name:  string;
  email: string;
  roles?: string[];
}


/** Build multipart form data for project creation when an attachment is
 * included — arrays are sent Laravel-style as indexed `key[i]` fields. */
function toFormData(payload: object, file: File, fileField = 'attachment'): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      value.forEach((v, i) => fd.append(`${key}[${i}]`, String(v)));
    } else if (typeof value === 'boolean') {
      fd.append(key, value ? '1' : '0');
    } else {
      fd.append(key, String(value));
    }
  }
  fd.append(fileField, file);
  return fd;
}

function unwrapArray<T>(body: unknown): T[] {
  if (Array.isArray(body)) return body as T[];
  const data = (body as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as T[];
  const nested = (data as { data?: unknown })?.data;
  if (Array.isArray(nested)) return nested as T[];
  return [];
}

export const createProjectApi = {
  departments() {
    return http.get<{ data: DepartmentLookup[] }>('/v1/employees/lookups/departments')
      .then(r => unwrapArray<DepartmentLookup>(r.data));
  },

  projectTypes(module: CreateProjectModule, departmentId?: number) {
    return http.get<{ data: ProjectType[] }>(
      `${basePath(module)}/projects/lookups/types`,
      { params: departmentId ? { department_id: departmentId } : undefined },
    ).then(r => normalizeProjectTypes(unwrapArray(r.data), module));
  },

  listAllProjectTypes(module: CreateProjectModule) {
    return http.get<{ data: ProjectType[] }>(`${basePath(module)}/project-types`)
      .then(r => normalizeProjectTypes(unwrapArray(r.data), module));
  },

  /** Admin create flow — prefer full type list, then match department client-side. */
  async projectTypesForDepartment(module: CreateProjectModule, departmentId: number) {
    try {
      const filtered = await http.get<{ data: ProjectType[] }>(
        `${basePath(module)}/project-types`,
        { params: { department_id: departmentId } },
      ).then(r => normalizeProjectTypes(unwrapArray(r.data), module));
      if (filtered.length > 0) return filtered;
    } catch {
      // Fall through when the filtered endpoint fails.
    }

    try {
      const all = await this.listAllProjectTypes(module);
      const byDept = filterTypesByDepartment(all, departmentId);
      if (byDept.length > 0) return byDept;
    } catch {
      // Fall through to lookup endpoint.
    }

    return this.projectTypes(module);
  },

  employees(module: CreateProjectModule, projectTypeId: number, search?: string) {
    return http.get<{ data: { data: EmployeeLookup[]; total: number } }>(
      `${basePath(module)}/projects/lookups/employees`,
      { params: { project_type_id: projectTypeId, search: search || undefined } },
    ).then(r => {
      const list = toApiArray<EmployeeLookup>(r.data.data);
      const total = (r.data.data as { total?: number })?.total ?? list.length;
      return { data: list, total };
    });
  },

  managers(module: CreateProjectModule, projectTypeId?: number) {
    return http.get<{ data: ManagerLookup[] }>(
      `${basePath(module)}/projects/lookups/managers`,
      { params: projectTypeId ? { project_type_id: projectTypeId } : undefined },
    ).then(r => normalizeManagers(unwrapArray(r.data)));
  },

  statuses(module: CreateProjectModule) {
    return http.get<{ data: StatusLookup[] }>(
      `${basePath(module)}/projects/lookups/statuses`,
    ).then(r => unwrapArray<StatusLookup>(r.data));
  },

  /** Prefer project lookup managers; fall back to admins with the right role. */
  async managersForCreate(module: CreateProjectModule, projectTypeId?: number) {
    try {
      if (projectTypeId) {
        const filtered = await this.managers(module, projectTypeId);
        if (filtered.length > 0) return filtered;
      }
      const all = await this.managers(module);
      if (all.length > 0) return all;
    } catch {
      // Fall through to admins list.
    }

    const roles = module === 'pm' ? PM_MANAGER_ROLES : SEO_MANAGER_ROLES;
    const res = await http.get<{ data: { data: AdminManagerRecord[] } }>('/v1/admins', {
      params: { per_page: 200 },
    });
    return toApiArray<AdminManagerRecord>(res.data.data)
      .filter(a => a.roles?.some(r => roles.has(r)))
      .map(a => ({ id: a.id, name: a.name, email: a.email }));
  },

  createPm(payload: CreatePmProjectPayload, attachment?: File | null) {
    if (attachment) {
      return http.post<{ status: string; message: string; data: { id: number } }>(
        '/v1/pm/projects',
        toFormData(payload, attachment),
        /* Let the browser set multipart boundary — do not force Content-Type. */
        { headers: { 'Content-Type': undefined } },
      );
    }
    return http.post<{ status: string; message: string; data: { id: number } }>(
      '/v1/pm/projects',
      payload,
    );
  },

  createSeo(payload: CreateSeoProjectPayload, attachment?: File | null) {
    if (attachment) {
      return http.post<{ status: string; message: string; data: { id: number } }>(
        '/v1/seo/projects',
        toFormData(payload, attachment),
        { headers: { 'Content-Type': undefined } },
      );
    }
    return http.post<{ status: string; message: string; data: { id: number } }>(
      '/v1/seo/projects',
      payload,
    );
  },

  listProjectTypes(module: CreateProjectModule, departmentId: number) {
    return http.get<{ data: ProjectType[] }>(
      `${basePath(module)}/project-types`,
      { params: { department_id: departmentId } },
    ).then(r => normalizeProjectTypes(unwrapArray(r.data), module));
  },

  createProjectType(module: CreateProjectModule, payload: CreateProjectTypePayload) {
    return http.post<{ data: ProjectType }>(`${basePath(module)}/project-types`, payload);
  },

  updateProjectType(module: CreateProjectModule, id: number, payload: CreateProjectTypePayload) {
    return http.post<{ data: ProjectType }>(`${basePath(module)}/project-types/${id}`, payload);
  },

  deleteProjectType(module: CreateProjectModule, id: number) {
    return http.delete<{ status: string; message: string }>(`${basePath(module)}/project-types/${id}`);
  },
};
