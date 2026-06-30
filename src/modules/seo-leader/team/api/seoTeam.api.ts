import { http }             from '@/shared/services/http.service';
import type { ApiResponse } from '@/shared/types/api.types';
import type {
  SeoTeamApiResponse,
  SeoTeamPaginatedResponse,
  SeoAttendanceOverview,
  SeoPendingInvitation,
  SeoTeamInvitePayload,
  SeoJobTitle,
  SeoProjectMember,
  SeoAvailableMember,
  SeoProjectInvitePayload,
  SeoActivityItem,
} from '../types/seoTeam.types';

/* ── Global SEO team ──────────────────────────────────────────────────── */

export const seoTeamApi = {
  getTeam(params?: { search?: string; per_page?: number; page?: number }) {
    return http.get<SeoTeamApiResponse<SeoTeamPaginatedResponse>>(
      '/v1/seo/team', { params }
    );
  },

  getMember(employeeId: string) {
    return http.get<SeoTeamApiResponse<SeoTeamPaginatedResponse>>(
      `/v1/seo/team/${employeeId}`
    );
  },

  getAttendanceOverview(date?: string) {
    return http.get<SeoTeamApiResponse<SeoAttendanceOverview>>(
      '/v1/seo/team/attendance/overview',
      { params: date ? { date } : undefined }
    );
  },

  getPendingInvitations() {
    return http.get<SeoTeamApiResponse<{ data: SeoPendingInvitation[] }>>(
      '/v1/seo/team/pending-invitations'
    );
  },

  invite(payload: SeoTeamInvitePayload) {
    return http.post<SeoTeamApiResponse<unknown>>(
      '/v1/seo/team/invite', payload
    );
  },

  resendInvitation(employeeId: string) {
    return http.post<SeoTeamApiResponse<unknown>>(
      `/v1/seo/team/${employeeId}/resend-invitation`
    );
  },

  getJobTitles() {
    return http.get<SeoTeamApiResponse<SeoJobTitle[]>>(
      '/v1/seo/team/lookups/job-titles'
    );
  },

  /* ── Project-scoped (used inside campaign detail) ───────────────────── */

  getProjectMembers(projectId: string | number) {
    return http.get<ApiResponse<{ data: SeoProjectMember[] } | SeoProjectMember[]>>(
      `/v1/seo/projects/${projectId}/team/members`
    );
  },

  getProjectTeam(projectId: string | number) {
    return http.get<ApiResponse<{ data: SeoProjectMember[] } | SeoProjectMember[]>>(
      `/v1/seo/projects/${projectId}/team`
    );
  },

  getAvailableForProject(projectId: string | number, search?: string) {
    return http.get<ApiResponse<{ data: SeoAvailableMember[] } | SeoAvailableMember[]>>(
      `/v1/seo/projects/${projectId}/team/available`,
      { params: search ? { search } : undefined }
    );
  },

  inviteToProject(projectId: string | number, payload: SeoProjectInvitePayload) {
    return http.post<ApiResponse<unknown>>(
      `/v1/seo/projects/${projectId}/team/invite`, payload
    );
  },

  removeFromProject(projectId: string | number, employeeId: string) {
    return http.delete<ApiResponse<unknown>>(
      `/v1/seo/projects/${projectId}/team/${employeeId}`
    );
  },

  getActivity(projectId: string | number, perPage = 20) {
    return http.get<ApiResponse<{ data: SeoActivityItem[] } | SeoActivityItem[]>>(
      `/v1/seo/projects/${projectId}/activity`,
      { params: { per_page: perPage } }
    );
  },
};
