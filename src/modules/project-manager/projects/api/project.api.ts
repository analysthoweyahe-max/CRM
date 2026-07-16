import { http } from '@/shared/services/http.service';
import type {
  PmProjectListApiResponse,
  PmProjectDetailsApiResponse,
  PmProjectApiResponse,
  PmLookupApiResponse,
  PmProjectPayload,
  PmAvailableMembersApiResponse,
  PmProjectTeamListApiResponse,
  PmAddProjectMemberPayload,
  PmAddProjectMembersBulkPayload,
  PmProjectInvitePayload,
  PmProjectTypeListApiResponse,
  PmProjectTypeApiResponse,
  PmProjectTypePayload,
  PmProjectPhase,
} from '../types/project.types';
import type { ProjectActivityApiResponse } from '../types/projectActivity.types';

export const pmProjectsApi = {
  list(params: { search?: string; status?: string; is_draft?: boolean; per_page?: number; page?: number }) {
    return http.get<PmProjectListApiResponse>('/v1/pm/projects', { params });
  },

  /** Project-manager-scoped list — returns only projects assigned to the caller. */
  myProjects(params: { search?: string; status?: string; is_draft?: boolean; per_page?: number; page?: number }) {
    return http.get<PmProjectListApiResponse>('/v1/pm/my-projects', { params });
  },

  create(payload: PmProjectPayload) {
    return http.post<PmProjectApiResponse>('/v1/pm/projects', payload);
  },

  get(id: number | string) {
    return http.get<PmProjectDetailsApiResponse>(`/v1/pm/projects/${id}`);
  },

  phases(id: number | string) {
    return http.get<{ status: string; message: string; data: PmProjectPhase[] }>(
      `/v1/pm/projects/${id}/phases`,
    );
  },

  getActivity(id: number | string, page = 1, perPage = 20) {
    return http.get<ProjectActivityApiResponse>(`/v1/pm/projects/${id}/activity`, {
      params: { page, per_page: perPage },
    });
  },

  getSettings(id: number | string) {
    return http.get<PmProjectApiResponse>(`/v1/pm/projects/${id}/settings`);
  },

  updateSettings(id: number | string, payload: PmProjectPayload) {
    return http.put<PmProjectApiResponse>(`/v1/pm/projects/${id}/settings`, payload);
  },

  update(id: number | string, payload: Partial<PmProjectPayload>) {
    return http.put<PmProjectDetailsApiResponse>(`/v1/pm/projects/${id}`, payload);
  },

  updateStatus(id: number | string, status: string) {
    return http.patch<PmProjectApiResponse>(`/v1/pm/projects/${id}/status`, { status });
  },

  remove(id: number | string) {
    return http.delete<{ status: string; message: string }>(`/v1/pm/projects/${id}`);
  },
};

export const pmProjectTeamApi = {
  list(projectId: number | string, params: { per_page?: number; page?: number } = {}) {
    return http.get<PmProjectTeamListApiResponse>(`/v1/pm/projects/${projectId}/team`, { params });
  },

  available(projectId: number | string, search?: string) {
    return http.get<PmAvailableMembersApiResponse>(`/v1/pm/projects/${projectId}/team/available`, {
      params: { search: search || undefined },
    });
  },

  addMember(projectId: number | string, payload: PmAddProjectMemberPayload | PmAddProjectMembersBulkPayload) {
    return http.post<{ status: string; message: string }>(`/v1/pm/projects/${projectId}/team/members`, payload);
  },

  invite(projectId: number | string, payload: PmProjectInvitePayload) {
    return http.post<{ status: string; message: string }>(`/v1/pm/projects/${projectId}/team/invite`, payload);
  },

  remove(projectId: number | string, employeeId: string) {
    return http.delete<{ status: string; message: string }>(`/v1/pm/projects/${projectId}/team/${employeeId}`);
  },
};

export const pmProjectLookupsApi = {
  statuses() {
    return http.get<PmLookupApiResponse>('/v1/pm/projects/lookups/statuses');
  },
  types(params?: { department_id?: number }) {
    return http.get<PmLookupApiResponse>('/v1/pm/projects/lookups/types', { params });
  },
  employees(params: { project_type_id: number; search?: string }) {
    return http.get<PmAvailableMembersApiResponse>('/v1/pm/projects/lookups/employees', { params });
  },
  taskStatuses() {
    return http.get<PmLookupApiResponse>('/v1/pm/projects/lookups/task-statuses');
  },
  taskPriorities() {
    return http.get<PmLookupApiResponse>('/v1/pm/projects/lookups/task-priorities');
  },
  managers(params?: { project_type_id?: number }) {
    return http.get<PmLookupApiResponse>('/v1/pm/projects/lookups/managers', { params });
  },
};

/* ── Project types CRUD (super-admin managed) ───────────────────────────── */
/** Prefer `pmAdminProjectTypesApi` from admin/project-types for UI (normalizes category). */
export const pmProjectTypesApi = {
  list(params?: { department_id?: number }) {
    return http.get<PmProjectTypeListApiResponse>('/v1/pm/project-types', { params });
  },
  get(id: number) {
    return http.get<PmProjectTypeApiResponse>(`/v1/pm/project-types/${id}`);
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
