/* eslint-disable @typescript-eslint/no-unused-vars */
import { ROUTES } from '@/app/router/routes';
import type {
  GroupedTasksData,
  MyTask,
  MyTaskColumn,
  MyTaskPhaseGroup,
  MyTasksPageConfig,
  ResolveTasksRoleInput,
  TasksApiRole,
} from '../types/myTasks.types';

export function resolveTasksRole(user: ResolveTasksRoleInput): TasksApiRole | null {
  // Trust the already-resolved portal role first — it's what RoleGuard used
  // to place the user on this page, and (via mapRolesToAppRole's priority
  // order) it correctly disambiguates accounts that carry both a pm-employee
  // and a seo-employee role slug. Falling back to raw actor/section/roles
  // heuristics before this caused SEO employees whose `section` isn't
  // exactly 'seo' to be routed to PM task endpoints while on an SEO page.
  if (user.role === 'seo-member')  return 'seo-employee';
  if (user.role === 'employee')    return 'pm-employee';
  if (user.role === 'seo-leader')  return 'seo-manager';
  if (user.role === 'manager')     return 'project-manager';

  if (user.actor === 'employee') {
    if (user.section === 'seo') return 'seo-employee';
    if (user.section === 'pm')  return 'pm-employee';
    if (user.roles.includes('seo-employee'))   return 'seo-employee';
    if (user.roles.includes('pm-employee'))    return 'pm-employee';
  }
  if (user.actor === 'admin') {
    if (user.roles.includes('seo-manager') || user.roles.includes('seo-leader')) {
      return 'seo-manager';
    }
    if (user.roles.includes('project-manager') || user.roles.includes('manager')) {
      return 'project-manager';
    }
  }

  return null;
}

export function resolveMyTasksConfig(tasksRole: TasksApiRole): MyTasksPageConfig {
  switch (tasksRole) {
    case 'pm-employee':
      return {
        tasksRole,
        canAddSelfTask:  true,
        canDragStatus:   true,
        showProjectName: true,
        taskDetailPath:  ROUTES.EMPLOYEE.TASK_DETAIL,
        projectPath:     (projectId) => ROUTES.PROJECT_MANAGER.DETAILS(String(projectId)),
      };
    case 'seo-employee':
      return {
        tasksRole,
        canAddSelfTask:  true,
        canDragStatus:   true,
        showProjectName: true,
        taskDetailPath:  ROUTES.SEO_MEMBER.TASK_DETAIL,
        projectPath:     (projectId) => ROUTES.SEO_MEMBER.DETAILS(String(projectId)),
      };
    case 'project-manager':
      return {
        tasksRole,
        canAddSelfTask:  false,
        canDragStatus:   true,
        showProjectName: true,
        taskDetailPath:  (projectId, taskId) =>
          `${ROUTES.PROJECT_MANAGER.DETAILS(String(projectId))}?task=${taskId}`,
        projectPath:     (projectId) => ROUTES.PROJECT_MANAGER.DETAILS(String(projectId)),
      };
    case 'seo-manager':
      return {
        tasksRole,
        canAddSelfTask:  false,
        canDragStatus:   true,
        showProjectName: true,
        taskDetailPath:  (projectId, taskId) =>
          `${ROUTES.SEO_LEADER.DETAILS(String(projectId))}?task=${taskId}`,
        projectPath:     (projectId) => ROUTES.SEO_LEADER.DETAILS(String(projectId)),
      };
  }
}

export function getTasksEndpoint(tasksRole: TasksApiRole, projectId?: number | string): string {
  if (projectId) {
    switch (tasksRole) {
      case 'pm-employee':
        return `/v1/pm/employee/projects/${projectId}/tasks`;
      case 'project-manager':
        return `/v1/pm/projects/${projectId}/tasks`;
      case 'seo-employee':
      case 'seo-manager':
        return `/v1/seo/projects/${projectId}/tasks`;
    }
  }

  switch (tasksRole) {
    case 'pm-employee':
      return '/v1/pm/employee/tasks';
    case 'seo-employee':
      return '/v1/seo/employee/tasks';
    case 'project-manager':
      return '/v1/pm/tasks';
    case 'seo-manager':
      return '/v1/seo/manager/tasks';
  }
}

/** Strip origin and `/api` prefix — http client baseURL already includes `/api`. */
export function resolveTasksApiPath(tasksApiUrl: string): string {
  let path = tasksApiUrl.trim();
  path = path.replace(/^https?:\/\/[^/]+/i, '');
  if (path.startsWith('/api/')) path = path.slice(4);
  else if (path === '/api') path = '/';
  return path.startsWith('/') ? path : `/${path}`;
}

export function getTasksQueryParams(
  tasksRole: TasksApiRole,
  projectId?: number | string,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  const endpoint = getTasksEndpoint(tasksRole, projectId);
  if (projectId && !endpoint.includes(`/${projectId}/`)) {
    params.project_id = projectId;
  }
  // "My Tasks" page: mine=1 (own assigned tasks) + include_partners=1
  // (same-project teammate tasks, read-only). Project Kanban uses
  // pmTaskApi.list(..., { mine: false }) separately.
  if (
    tasksRole === 'pm-employee'
    || tasksRole === 'seo-employee'
    || tasksRole === 'project-manager'
  ) {
    params.mine = 1;
  }
  if (tasksRole === 'pm-employee' || tasksRole === 'seo-employee') {
    params.include_partners = 1;
  }
  return params;
}

/** Prefer the task UUID for route/API params when present, falling back to the numeric id. */
export function getTaskRouteId(task: MyTask, _tasksRole: TasksApiRole): string | number {
  return task.uuid ?? task.id;
}

interface RawTaskWire {
  id:               number;
  uuid?:            string;
  taskNumber?:      number;
  title:            string;
  description?:     string | null;
  status:           string;
  statusLabel?:     string;
  priority:         string;
  priorityLabel?:   string;
  dueDate?:         string | null;
  estimatedHours?:  number | null;
  project?:         { id: number | string; name: string } | null;
  phase?:           { id: number | string; name: string } | string | null;
  assignee?:        {
    id: string; name: string; email?: string;
    avatarUrl?: string | null; avatarInitial?: string;
  } | null;
  assignees?:       Array<{
    id: string; name: string; email?: string;
    avatarUrl?: string | null; avatarInitial?: string;
  }>;
  completedAt?:     string | null;
  attachmentsCount?: number;
  commentsCount?:    number;
  createdAt?:       string;
  updatedAt?:       string;
  dueAt?:           string | null;
  isOverdue?:       boolean;
  isDelayed?:       boolean;
  overdueLabel?:    string | null;
  canExtend?:       boolean;
  importantLinks?:  string[];
  isMine?:          boolean;
  is_mine?:         boolean;
}

function wireFromRecord(raw: Record<string, unknown>): RawTaskWire {
  const project = readRecord(raw.project);
  const phase = raw.phase;
  const phaseObj = readRecord(phase);
  const importantRaw = raw.importantLinks ?? raw.important_links;
  const importantLinks = Array.isArray(importantRaw)
    ? importantRaw.filter((v): v is string => typeof v === 'string')
    : undefined;

  return {
    id:               Number(raw.id),
    uuid:             typeof raw.uuid === 'string' ? raw.uuid : undefined,
    taskNumber:       Number(raw.taskNumber ?? raw.task_number ?? raw.id),
    title:            String(raw.title ?? ''),
    description:      (raw.description as string | null | undefined) ?? null,
    status:           String(raw.status ?? 'pending'),
    statusLabel:      String(raw.statusLabel ?? raw.status_label ?? raw.status ?? 'pending'),
    priority:         String(raw.priority ?? 'normal'),
    priorityLabel:    String(raw.priorityLabel ?? raw.priority_label ?? raw.priority ?? 'normal'),
    dueDate:          (raw.dueDate ?? raw.due_date ?? null) as string | null,
    estimatedHours:   raw.estimatedHours != null
      ? Number(raw.estimatedHours)
      : raw.estimated_hours != null
        ? Number(raw.estimated_hours)
        : null,
    project:          project
      ? { id: project.id as number | string, name: String(project.name ?? '') }
      : null,
    phase:            phaseObj
      ? { id: phaseObj.id as number | string, name: String(phaseObj.name ?? '') }
      : typeof phase === 'string'
        ? phase
        : null,
    assignee:         readRecord(raw.assignee) as RawTaskWire['assignee'],
    assignees:        Array.isArray(raw.assignees) ? raw.assignees as RawTaskWire['assignees'] : undefined,
    completedAt:      (raw.completedAt ?? raw.completed_at ?? null) as string | null,
    attachmentsCount: Number(raw.attachmentsCount ?? raw.attachments_count ?? 0) || undefined,
    commentsCount:    Number(raw.commentsCount ?? raw.comments_count ?? 0) || undefined,
    createdAt:        String(raw.createdAt ?? raw.created_at ?? ''),
    updatedAt:        String(raw.updatedAt ?? raw.updated_at ?? ''),
    dueAt:            (raw.dueAt ?? raw.due_at ?? null) as string | null,
    isOverdue:        Boolean(raw.isOverdue ?? raw.is_overdue),
    isDelayed:        Boolean(raw.isDelayed ?? raw.is_delayed),
    overdueLabel:     (raw.overdueLabel ?? raw.overdue_label ?? null) as string | null,
    canExtend:        Boolean(raw.canExtend ?? raw.can_extend),
    importantLinks,
    isMine:           raw.isMine != null || raw.is_mine != null
      ? Boolean(raw.isMine ?? raw.is_mine)
      : undefined,
    is_mine:          raw.is_mine != null || raw.isMine != null
      ? Boolean(raw.is_mine ?? raw.isMine)
      : undefined,
  };
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function normalizePhase(raw: RawTaskWire['phase']): MyTask['phase'] {
  if (!raw) return undefined;
  // SEO tasks carry a bare phase name with no id — use the name itself as
  // the id so distinct phases don't all collapse into one "0" bucket when
  // grouped into columns.
  if (typeof raw === 'string') return { id: raw, name: raw };
  return { id: Number(raw.id), name: raw.name };
}

function normalizeAssignee(raw: RawTaskWire): MyTask['assignee'] {
  const source = raw.assignee
    ?? (Array.isArray(raw.assignees) ? raw.assignees[0] : undefined);
  if (!source) return undefined;

  const initial = source.avatarInitial ?? (source.name?.charAt(0) ?? '?');
  return {
    id:            String(source.id),
    name:          source.name,
    email:         source.email ?? '',
    avatarUrl:     source.avatarUrl ?? null,
    avatarInitial: initial,
  };
}

function normalizeTask(raw: RawTaskWire | Record<string, unknown>): MyTask {
  const wire = 'title' in raw && typeof raw.title === 'string'
    ? raw as RawTaskWire
    : wireFromRecord(raw as Record<string, unknown>);
  return {
    id:               wire.id,
    uuid:             wire.uuid ?? String(wire.id),
    taskNumber:       wire.taskNumber ?? wire.id,
    title:            wire.title,
    description:      wire.description ?? null,
    status:           wire.status,
    statusLabel:      wire.statusLabel ?? wire.status,
    priority:         wire.priority,
    priorityLabel:    wire.priorityLabel ?? wire.priority,
    dueDate:          wire.dueDate ?? null,
    estimatedHours:   wire.estimatedHours ?? null,
    project:          wire.project
      ? { id: Number(wire.project.id), name: wire.project.name }
      : undefined,
    phase:            normalizePhase(wire.phase),
    assignee:         normalizeAssignee(wire),
    completedAt:      wire.completedAt ?? null,
    attachmentsCount: wire.attachmentsCount,
    commentsCount:    wire.commentsCount,
    createdAt:        wire.createdAt ?? '',
    updatedAt:        wire.updatedAt ?? '',
    dueAt:            wire.dueAt ?? null,
    isOverdue:        wire.isOverdue,
    isDelayed:        wire.isDelayed,
    overdueLabel:     wire.overdueLabel ?? null,
    canExtend:        wire.canExtend,
    importantLinks:   wire.importantLinks?.length ? wire.importantLinks : undefined,
    isMine:           wire.isMine ?? wire.is_mine,
    is_mine:          wire.is_mine ?? wire.isMine,
  };
}

export function unwrapTasksPayload(envelope: unknown): Record<string, unknown> {
  let current = envelope as Record<string, unknown>;
  for (let depth = 0; depth < 4; depth++) {
    if (!current || typeof current !== 'object') return {};
    if (Array.isArray(current.columns) || Array.isArray(current.phases) || Array.isArray(current.tasks)) {
      return current;
    }
    const inner = current.data;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      current = inner as Record<string, unknown>;
      continue;
    }
    break;
  }
  return current ?? {};
}

/** Prefer API `columns`; keep SEO `phases` when both are returned. */
export function normalizeGroupedTasks(payload: unknown): GroupedTasksData {
  const data = unwrapTasksPayload(payload);

  let columns: MyTaskColumn[] = [];
  let phases: MyTaskPhaseGroup[] | undefined;

  if (Array.isArray(data.columns)) {
    columns = (data.columns as Array<Record<string, unknown>>)
      .map((col) => ({
        status:      String(col.status ?? 'pending'),
        statusLabel: String(col.statusLabel ?? col.status_label ?? col.status ?? 'pending'),
        tasks:       (Array.isArray(col.tasks) ? col.tasks : []).map((task) =>
          normalizeTask(task as Record<string, unknown>),
        ),
      }));
  }

  if (Array.isArray(data.phases)) {
    phases = (data.phases as Array<Record<string, unknown>>)
      .map((group) => ({
        phase: String(group.phase ?? ''),
        tasks: (Array.isArray(group.tasks) ? group.tasks : []).map((task) =>
          normalizeTask(task as Record<string, unknown>),
        ),
      }));
    if (columns.length === 0) {
      columns = groupTasksByStatus(phases.flatMap((p) => p.tasks));
    }
  }

  if (columns.length === 0 && Array.isArray(data.tasks)) {
    const flat = (data.tasks as Array<Record<string, unknown>>).map(normalizeTask);
    columns = groupTasksByStatus(flat);
  }

  const total = Number(data.total ?? countTasks(columns));
  return { columns, phases, total };
}

/** Backfill columns for every catalog status that has no current tasks, so
 *  the board always shows the full admin-configured set instead of only
 *  whichever statuses happen to have a task right now. Any status found on
 *  a task but missing from the catalog (renamed/deactivated after the task
 *  was created) is kept as a trailing extra column instead of being dropped. */
export function fillCatalogColumns(
  columns: MyTaskColumn[],
  catalog: { key: string; label: string }[],
): MyTaskColumn[] {
  if (catalog.length === 0) return columns;
  const byStatus = new Map(columns.map((c) => [c.status, c]));
  const filled = catalog.map((c) =>
    byStatus.get(c.key) ?? { status: c.key, statusLabel: c.label, tasks: [] },
  );
  const extras = columns.filter((c) => !catalog.some((cat) => cat.key === c.status));
  return [...filled, ...extras];
}

function countTasks(columns: MyTaskColumn[]): number {
  return columns.reduce((sum, col) => sum + col.tasks.length, 0);
}

function groupTasksByStatus(tasks: MyTask[]): MyTaskColumn[] {
  const map = new Map<string, MyTaskColumn>();
  for (const task of tasks) {
    const existing = map.get(task.status);
    if (existing) {
      existing.tasks.push(task);
    } else {
      map.set(task.status, {
        status:      task.status,
        statusLabel: task.statusLabel,
        tasks:       [task],
      });
    }
  }
  return [...map.values()];
}

/**
 * Merge per-project task fetches into one combined view — used for PM
 * employees, whose backend "all my tasks across projects" endpoint doesn't
 * reliably aggregate (confirmed empty even when per-project data exists).
 * Each project's tasks are stamped with that project's id/name, since a
 * project-scoped task response doesn't repeat the project on every task.
 */
export function mergeGroupedTasksAcrossProjects(
  perProject: Array<{ project: { id: number | string; name: string }; data: GroupedTasksData }>,
): GroupedTasksData {
  const columnMap = new Map<string, MyTaskColumn>();

  for (const { project, data } of perProject) {
    for (const col of data.columns) {
      const existing = columnMap.get(col.status);
      const stampedTasks = col.tasks.map((task) => ({
        ...task,
        project: task.project ?? project,
      }));
      if (existing) {
        existing.tasks.push(...stampedTasks);
      } else {
        columnMap.set(col.status, { status: col.status, statusLabel: col.statusLabel, tasks: [...stampedTasks] });
      }
    }
  }

  const columns = [...columnMap.values()];
  return { columns, total: countTasks(columns) };
}

export function extractProjectsFromColumns(columns: MyTaskColumn[]): { id: number | string; name: string }[] {
  const seen = new Map<string, { id: number | string; name: string }>();
  for (const col of columns) {
    for (const task of col.tasks) {
      if (task.project) {
        const key = String(task.project.id);
        if (!seen.has(key)) seen.set(key, { id: task.project.id, name: task.project.name });
      }
    }
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
}

/** Keep only tasks assigned to the current user when assignee is present in the payload. */
export function filterTasksForAssignee(
  data: GroupedTasksData,
  currentUserId?: string,
): GroupedTasksData {
  if (!currentUserId) return data;

  const columns = data.columns.map((col) => ({
    ...col,
    tasks: col.tasks.filter((task) => {
      if (!task.assignee?.id) return true;
      return String(task.assignee.id) === String(currentUserId);
    }),
  }));

  return {
    columns,
    total: columns.reduce((sum, col) => sum + col.tasks.length, 0),
  };
}

type OwnershipUser = { id?: string | null; employeeId?: string | null } | null | undefined;

/** Canonical ownership flag from API: `is_mine ?? isMine ?? false`. */
export function readTaskIsMine(task: Pick<MyTask, 'isMine' | 'is_mine'>): boolean {
  return task.is_mine ?? task.isMine ?? false;
}

/**
 * Prefer explicit API flag; if omitted, fall back to assignee uuid vs signed-in
 * employee. Used when stamping boards after list normalize.
 */
export function resolveTaskIsMine(task: MyTask, user: OwnershipUser): boolean {
  if (task.is_mine != null || task.isMine != null) {
    return readTaskIsMine(task);
  }
  if (!task.assignee?.id || !user) return false;
  const sid = String(task.assignee.id);
  if (user.id && sid === String(user.id)) return true;
  if (user.employeeId && sid === String(user.employeeId)) return true;
  return false;
}

/** Own tasks only — partner cards must not open detail or call mutations. */
export function isEditableMyTask(task: MyTask): boolean {
  return readTaskIsMine(task);
}

/** Stamp `isMine` / `is_mine` on every task so the board can lock partner cards. */
export function annotateGroupedTasksOwnership(
  data: GroupedTasksData,
  user: OwnershipUser,
): GroupedTasksData {
  const stamp = (task: MyTask): MyTask => {
    const isMine = resolveTaskIsMine(task, user);
    return { ...task, isMine, is_mine: isMine };
  };
  return {
    ...data,
    columns: data.columns.map((col) => ({
      ...col,
      tasks: col.tasks.map(stamp),
    })),
    phases: data.phases?.map((group) => ({
      ...group,
      tasks: group.tasks.map(stamp),
    })),
  };
}

export function isTaskOverdue(task: MyTask): boolean {
  if (!task.dueDate || task.status === 'completed') return false;
  const due = new Date(task.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export const PRIORITY_BADGE: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  high:   'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  normal: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  medium: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  low:    'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
};

