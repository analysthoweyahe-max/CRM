import { http } from '@/shared/services/http.service';
import type { ApiResponse } from '@/shared/types/api.types';
import type { Role } from '@/shared/types/role.types';
import { campaignApi } from '@/modules/seo-leader/campaigns/api/campaign.api';
import type {
  MyProjectsModule,
  PaginatedProjectsResponse,
  PmProject,
  ProjectSection,
  SeoProject,
  SeoMemberDashboardPayload,
  StatusLookupItem,
} from '../types/myProjects.types';

export interface MyProjectsListParams {
  search?:   string;
  status?:   string;
  is_draft?: boolean;
  per_page?: number;
  page?:     number;
}

/** Strip undefined/false draft flag — Laravel chokes on `is_draft=false` in query strings. */
function buildListQueryParams(params: MyProjectsListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (params.search) query.search = params.search;
  if (params.status) query.status = params.status;
  if (params.is_draft === true) query.is_draft = 1;
  if (params.per_page != null) query.per_page = params.per_page;
  if (params.page != null) query.page = params.page;
  return query;
}

function unwrapPaginatedPayload<T>(body: unknown): PaginatedProjectsResponse<T> {
  const root = body as { data?: PaginatedProjectsResponse<T> | T[] };
  const payload = root?.data;

  if (payload && typeof payload === 'object' && !Array.isArray(payload) && Array.isArray(payload.data)) {
    return payload as PaginatedProjectsResponse<T>;
  }

  if (Array.isArray(payload)) {
    return {
      data:         payload as T[],
      current_page: 1,
      last_page:    1,
      total:        payload.length,
    };
  }

  return { data: [], current_page: 1, last_page: 1, total: 0 };
}

export function getMyProjectsEndpoint(role: Role, module: MyProjectsModule): string {
  if (module === 'pm') {
    if (role === 'employee') return '/v1/pm/my-projects';
    return '/v1/pm/projects';
  }
  if (role === 'seo-member') return '/v1/seo/dashboard';
  return '/v1/seo/projects';
}

function unwrapLookupItems(body: unknown): StatusLookupItem[] {
  if (Array.isArray(body)) return body as StatusLookupItem[];
  const data = (body as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as StatusLookupItem[];
  return [];
}

export const myProjectsApi = {
  async listPm(params: MyProjectsListParams, asEmployee: boolean) {
    const path = asEmployee ? '/v1/pm/my-projects' : '/v1/pm/projects';
    const res = await http.get<{ status: string; message: string; data: PaginatedProjectsResponse<PmProject> }>(
      path,
      { params: buildListQueryParams(params) },
    );
    return { ...res, data: { ...res.data, data: unwrapPaginatedPayload<PmProject>(res.data) } };
  },

  /** PM employee's own project list — confirmed reliable source of which
   * projects the employee belongs to (unlike `/v1/pm/dashboard`, which
   * returns empty sections for accounts confirmed to have real projects). */
  async listEmployeeProjects(): Promise<PmProject[]> {
    const res = await http.get<{ status: string; message: string; data: PaginatedProjectsResponse<PmProject> }>(
      '/v1/employee/projects',
    );
    return unwrapPaginatedPayload<PmProject>(res.data).data;
  },

  async listSeo(params: MyProjectsListParams) {
    const res = await http.get<ApiResponse<PaginatedProjectsResponse<SeoProject>>>(
      '/v1/seo/projects',
      { params: buildListQueryParams(params) },
    );
    return { ...res, data: { ...res.data, data: unwrapPaginatedPayload<SeoProject>(res.data) } };
  },

  async getSeoEmployeeDashboard() {
    const res = await http.get<ApiResponse<SeoMemberDashboardPayload | { data: SeoMemberDashboardPayload }>>(
      '/v1/seo/dashboard',
    );
    const payload = res.data?.data;
    const normalized: SeoMemberDashboardPayload =
      payload && typeof payload === 'object' && 'myProjects' in payload
        ? payload
        : (payload as { data?: SeoMemberDashboardPayload })?.data ?? { myProjects: { sections: [] } };
    return { ...res, data: { ...res.data, data: normalized } };
  },

  getPmStatuses() {
    return http.get<{ status: string; message: string; data: unknown }>('/v1/pm/projects/lookups/statuses')
      .then(r => unwrapLookupItems(r.data));
  },

  getSeoStatuses() {
    return campaignApi.getStatuses().then(r => unwrapLookupItems(r.data));
  },
};
