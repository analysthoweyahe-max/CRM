import { http } from '@/shared/services/http.service';
import type { ApiResponse } from '@/shared/types/api.types';
import type { Role } from '@/shared/types/role.types';
import { campaignApi } from '@/modules/seo-leader/campaigns/api/campaign.api';
import type {
  MyProjectsModule,
  PaginatedProjectsResponse,
  PmProject,
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

/** Use 0/1 for draft flag — Laravel treats the string "false" as truthy in query strings. */
function buildListQueryParams(params: MyProjectsListParams): Record<string, string | number> {
  const query: Record<string, string | number> = {};
  if (params.search) query.search = params.search;
  if (params.status) query.status = params.status;
  if (params.is_draft === true)  query.is_draft = 1;
  if (params.is_draft === false) query.is_draft = 0;
  if (params.per_page != null) query.per_page = params.per_page;
  if (params.page != null) query.page = params.page;
  return query;
}

function unwrapPaginatedPayload<T>(body: unknown): PaginatedProjectsResponse<T> {
  let current: unknown = body;

  for (let depth = 0; depth < 4; depth++) {
    if (!current || typeof current !== 'object') break;

    if (Array.isArray(current)) {
      return {
        data:         current as T[],
        current_page: 1,
        last_page:    1,
        total:        current.length,
      };
    }

    const obj = current as Record<string, unknown>;

    if (Array.isArray(obj.data) && (obj.current_page != null || obj.total != null || obj.last_page != null)) {
      return obj as unknown as PaginatedProjectsResponse<T>;
    }

    if (Array.isArray(obj.data)) {
      return {
        data:         obj.data as T[],
        current_page: 1,
        last_page:    1,
        total:        obj.data.length,
      };
    }

    if (obj.data && typeof obj.data === 'object') {
      current = obj.data;
      continue;
    }

    break;
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

const SEO_STATUS_KEYS = new Set(['not_started', 'in_progress', 'on_hold', 'completed']);

/** Normalize sparse employee-project rows into SeoProject for the My Projects UI. */
function normalizeSeoEmployeeProject(raw: unknown): SeoProject {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const statusRaw = String(r.status ?? 'in_progress');
  const status = (SEO_STATUS_KEYS.has(statusRaw) ? statusRaw : 'in_progress') as SeoProject['status'];

  return {
    id:                     (typeof r.uuid === 'string' && r.uuid.trim()
      ? r.uuid.trim()
      : (r.id as number | string)),
    name:                   String(r.name ?? ''),
    targetDomain:           (r.targetDomain ?? r.target_domain ?? null) as string | null,
    campaignType:           String(r.campaignType ?? r.campaign_type ?? r.projectType ?? ''),
    campaignTypeLabel:      String(r.campaignTypeLabel ?? r.campaign_type_label ?? r.projectTypeLabel ?? ''),
    status,
    statusLabel:            String(r.statusLabel ?? r.status_label ?? status),
    isDraft:                Boolean(r.isDraft ?? r.is_draft ?? false),
    startDate:              (r.startDate ?? r.start_date ?? null) as string | null,
    expectedEndDate:        (r.expectedEndDate ?? r.expected_end_date ?? null) as string | null,
    contractDurationMonths: (r.contractDurationMonths ?? r.contract_duration_months ?? null) as number | null,
    githubLink:             (r.githubLink ?? r.github_link ?? null) as string | null,
    driveLink:              (r.driveLink ?? r.drive_link ?? null) as string | null,
    workspaceUrl:           (r.workspaceUrl ?? r.workspace_url ?? null) as string | null,
    tasksUrl:               (r.tasksUrl ?? r.tasks_url ?? null) as string | null,
    tasksAssigned:          r.tasksAssigned != null ? Number(r.tasksAssigned)
      : r.tasks_assigned != null ? Number(r.tasks_assigned)
      : r.tasksTotal != null ? Number(r.tasksTotal)
      : r.tasks_total != null ? Number(r.tasks_total)
      : undefined,
    tasksCompleted:         r.tasksCompleted != null ? Number(r.tasksCompleted)
      : r.tasks_completed != null ? Number(r.tasks_completed)
      : undefined,
    tasksInProgress:        r.tasksInProgress != null ? Number(r.tasksInProgress)
      : r.tasks_in_progress != null ? Number(r.tasks_in_progress)
      : undefined,
    progressPercent:        r.progressPercent != null ? Number(r.progressPercent)
      : r.progress_percent != null ? Number(r.progress_percent)
      : undefined,
  };
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

  /** SEO employee's own project list — `/v1/seo/dashboard` myProjects.sections
   * is often empty even when the member is assigned to real projects. */
  async listSeoEmployeeProjects(): Promise<SeoProject[]> {
    const res = await http.get<{ status: string; message: string; data: unknown }>(
      '/v1/seo/employee/projects',
    );
    return unwrapPaginatedPayload<SeoProject>(res.data).data.map(normalizeSeoEmployeeProject);
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
