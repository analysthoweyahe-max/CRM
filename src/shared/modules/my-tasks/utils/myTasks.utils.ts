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
  if (user.actor === 'employee') {
    if (user.section === 'seo') return 'seo-employee';
    if (user.section === 'pm')  return 'pm-employee';
    if (user.roles.includes('pm-employee'))    return 'pm-employee';
    if (user.roles.includes('seo-employee'))   return 'seo-employee';
  }
  if (user.actor === 'admin') {
    if (user.roles.includes('project-manager') || user.roles.includes('manager')) {
      return 'project-manager';
    }
    if (user.roles.includes('seo-manager') || user.roles.includes('seo-leader')) {
      return 'seo-manager';
    }
  }

  if (user.role === 'employee')    return 'pm-employee';
  if (user.role === 'seo-member')  return 'seo-employee';
  if (user.role === 'manager')     return 'project-manager';
  if (user.role === 'seo-leader')  return 'seo-manager';
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
        projectPath:     (_projectId) => ROUTES.EMPLOYEE.MY_PROJECTS,
      };
    case 'seo-employee':
      return {
        tasksRole,
        canAddSelfTask:  true,
        canDragStatus:   true,
        showProjectName: true,
        taskDetailPath:  ROUTES.SEO_MEMBER.TASK_DETAIL,
        projectPath:     (_projectId) => ROUTES.SEO_MEMBER.MY_PROJECTS,
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
        return `/v1/seo/employee/projects/${projectId}/tasks`;
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
  if (tasksRole === 'pm-employee') {
    params.mine = 1;
  }
  return params;
}

/** PM uses integer id; SEO uses uuid in routes and API paths. */
export function getTaskRouteId(task: MyTask, tasksRole: TasksApiRole): string | number {
  if (tasksRole === 'seo-employee' || tasksRole === 'seo-manager') {
    return task.uuid;
  }
  return task.id;
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
}

function wireFromRecord(raw: Record<string, unknown>): RawTaskWire {
  const project = readRecord(raw.project);
  const phase = raw.phase;
  const phaseObj = readRecord(phase);

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
  };
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function normalizePhase(raw: RawTaskWire['phase']): MyTask['phase'] {
  if (!raw) return undefined;
  if (typeof raw === 'string') return { id: 0, name: raw };
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
  perProject: Array<{ project: { id: number; name: string }; data: GroupedTasksData }>,
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

export function extractProjectsFromColumns(columns: MyTaskColumn[]): { id: number; name: string }[] {
  const seen = new Map<number, string>();
  for (const col of columns) {
    for (const task of col.tasks) {
      if (task.project) seen.set(task.project.id, task.project.name);
    }
  }
  return [...seen.entries()]
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
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

export const COLUMN_ACCENT: Record<string, { dot: string; accent: string; surface: string }> = {
  pending:      { dot: 'bg-gray-400',    accent: 'border-t-gray-400',    surface: 'bg-gray-50/90 dark:bg-gray-900/40' },
  in_progress:  { dot: 'bg-[#A0CD39]', accent: 'border-t-[#A0CD39]', surface: 'bg-[#f7fbea]/80 dark:bg-[#A0CD39]/5' },
  in_review:    { dot: 'bg-amber-500',   accent: 'border-t-amber-500',   surface: 'bg-amber-50/70 dark:bg-amber-900/10' },
  needs_review: { dot: 'bg-amber-500',   accent: 'border-t-amber-500',   surface: 'bg-amber-50/70 dark:bg-amber-900/10' },
  blocked:      { dot: 'bg-red-500',     accent: 'border-t-red-500',     surface: 'bg-red-50/70 dark:bg-red-900/10' },
  completed:    { dot: 'bg-emerald-500', accent: 'border-t-emerald-500', surface: 'bg-emerald-50/60 dark:bg-emerald-900/10' },
};

export const DEFAULT_COLUMN_ACCENT = {
  dot: 'bg-gray-400',
  accent: 'border-t-gray-400',
  surface: 'bg-gray-50/90 dark:bg-gray-900/40',
};
