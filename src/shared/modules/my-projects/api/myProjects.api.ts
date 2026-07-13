import { http } from '@/shared/services/http.service';
import type { ApiResponse } from '@/shared/types/api.types';
import type { Role } from '@/shared/types/role.types';
import { campaignApi } from '@/modules/seo-leader/campaigns/api/campaign.api';
import type {
  EmployeeMembershipProject,
  MyProjectsModule,
  PaginatedProjectsResponse,
  PmProject,
  ProjectStatus,
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
    if (role === 'employee') return '/v1/employee/projects';
    return '/v1/pm/projects';
  }
  if (role === 'seo-member') return '/v1/seo/employee/projects';
  return '/v1/seo/projects';
}

function unwrapLookupItems(body: unknown): StatusLookupItem[] {
  if (Array.isArray(body)) return body as StatusLookupItem[];
  const data = (body as { data?: unknown })?.data;
  if (Array.isArray(data)) return data as StatusLookupItem[];
  return [];
}

const STATUS_KEYS = new Set(['not_started', 'in_progress', 'on_hold', 'completed']);

/**
 * Membership project from:
 * - GET /v1/employee/projects  (module: seo | pm)
 * - GET /v1/seo/employee/projects (SEO only)
 *
 * Uses the numeric id for opening details; uuid is kept alongside for
 * callers that still need it, but never as the primary identifier.
 */
export function normalizeMembershipProject(raw: unknown): EmployeeMembershipProject | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  const uuid = typeof r.uuid === 'string' ? r.uuid.trim() : '';
  const id: number | string = r.id != null ? (r.id as number | string) : uuid;
  if (id === '' || id == null) return null;

  const statusRaw = String(r.status ?? 'in_progress');
  const status = (STATUS_KEYS.has(statusRaw) ? statusRaw : 'in_progress') as ProjectStatus;
  const moduleRaw = String(r.module ?? '').toLowerCase();
  const module: 'seo' | 'pm' = moduleRaw === 'pm' ? 'pm' : 'seo';

  return {
    id,
    uuid,
    name:            String(r.name ?? ''),
    status,
    statusLabel:     String(r.statusLabel ?? r.status_label ?? status),
    myProjectRole:   (r.myProjectRole ?? r.my_project_role ?? null) as string | null,
    module,
    projectTypeLabel: (r.projectTypeLabel ?? r.project_type_label
      ?? r.campaignTypeLabel ?? r.campaign_type_label ?? null) as string | null,
    progressPercent: r.progressPercent != null ? Number(r.progressPercent)
      : r.progress_percent != null ? Number(r.progress_percent)
      : undefined,
    tasksAssigned:   r.tasksAssigned != null ? Number(r.tasksAssigned)
      : r.tasks_assigned != null ? Number(r.tasks_assigned)
      : r.tasksTotal != null ? Number(r.tasksTotal)
      : r.tasks_total != null ? Number(r.tasks_total)
      : undefined,
    tasksCompleted:  r.tasksCompleted != null ? Number(r.tasksCompleted)
      : r.tasks_completed != null ? Number(r.tasks_completed)
      : undefined,
    tasksInProgress: r.tasksInProgress != null ? Number(r.tasksInProgress)
      : r.tasks_in_progress != null ? Number(r.tasks_in_progress)
      : undefined,
    workspaceUrl:    (r.workspaceUrl ?? r.workspace_url ?? null) as string | null,
    tasksUrl:        (r.tasksUrl ?? r.tasks_url ?? null) as string | null,
  };
}

function toSeoProject(m: EmployeeMembershipProject): SeoProject {
  return {
    id:                     m.id,
    uuid:                   m.uuid,
    name:                   m.name,
    targetDomain:           null,
    campaignType:           '',
    campaignTypeLabel:      m.projectTypeLabel ?? '',
    status:                 m.status,
    statusLabel:            m.statusLabel,
    isDraft:                false,
    startDate:              null,
    expectedEndDate:        null,
    contractDurationMonths: null,
    githubLink:             null,
    driveLink:              null,
    workspaceUrl:           m.workspaceUrl,
    tasksUrl:               m.tasksUrl,
    tasksAssigned:          m.tasksAssigned,
    tasksCompleted:         m.tasksCompleted,
    tasksInProgress:        m.tasksInProgress,
    progressPercent:        m.progressPercent,
    myProjectRole:          m.myProjectRole,
    module:                 m.module,
  };
}

export const myProjectsApi = {
  /** Manager / admin PM project list — NOT for employee membership. */
  async listPm(params: MyProjectsListParams, _asEmployee = false) {
    const res = await http.get<{ status: string; message: string; data: PaginatedProjectsResponse<PmProject> }>(
      '/v1/pm/projects',
      { params: buildListQueryParams(params) },
    );
    const page = unwrapPaginatedPayload<PmProject>(res.data);
    return { ...res, data: { ...res.data, data: page } };
  },

  /**
   * Employee membership projects (seo_project_members / pm membership).
   * - GET /v1/employee/projects  (module: seo | pm)
   * - plus SEO membership: GET /v1/seo/employee/projects
   * Never uses manager project lists.
   */
  async listEmployeeProjects(): Promise<EmployeeMembershipProject[]> {
    const [general, seoOnly] = await Promise.all([
      http.get<{ status: string; message: string; data: unknown }>('/v1/employee/projects')
        .then((res) => unwrapPaginatedPayload<unknown>(res.data).data
          .map(normalizeMembershipProject)
          .filter((p): p is EmployeeMembershipProject => !!p))
        .catch(() => [] as EmployeeMembershipProject[]),
      this.listSeoEmployeeMembership().catch(() => [] as EmployeeMembershipProject[]),
    ]);

    const byUuid = new Map<string, EmployeeMembershipProject>();
    for (const project of [...general, ...seoOnly]) {
      const key = project.uuid || String(project.id);
      if (!key) continue;
      // Prefer explicit SEO row when same uuid appears in both sources
      const existing = byUuid.get(key);
      if (!existing || project.module === 'seo') {
        byUuid.set(key, project);
      }
    }
    return Array.from(byUuid.values());
  },

  /** Manager SEO project list — NOT for employee membership. */
  async listSeo(params: MyProjectsListParams) {
    const res = await http.get<ApiResponse<PaginatedProjectsResponse<SeoProject>>>(
      '/v1/seo/projects',
      { params: buildListQueryParams(params) },
    );
    return { ...res, data: { ...res.data, data: unwrapPaginatedPayload<SeoProject>(res.data) } };
  },

  /**
   * Raw SEO membership rows (seo_project_members).
   * GET /v1/seo/employee/projects — fallback: singular /project
   */
  async listSeoEmployeeMembership(): Promise<EmployeeMembershipProject[]> {
    const tryPath = async (path: string): Promise<EmployeeMembershipProject[]> => {
      const res = await http.get<{ status: string; message: string; data: unknown }>(path);
      const out: EmployeeMembershipProject[] = [];
      for (const raw of unwrapPaginatedPayload<unknown>(res.data).data) {
        const normalized = normalizeMembershipProject(raw);
        if (!normalized) continue;
        out.push({ ...normalized, module: 'seo' });
      }
      return out;
    };

    try {
      const primary = await tryPath('/v1/seo/employee/projects');
      if (primary.length > 0) return primary;
    } catch {
      /* try singular */
    }

    try {
      return await tryPath('/v1/seo/employee/project');
    } catch {
      return [];
    }
  },

  /**
   * SEO employee membership only.
   * GET /api/v1/seo/employee/projects
   */
  async listSeoEmployeeProjects(): Promise<SeoProject[]> {
    const membership = await this.listSeoEmployeeMembership();
    return membership.map(toSeoProject);
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
