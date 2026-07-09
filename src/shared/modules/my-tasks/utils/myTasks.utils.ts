import { ROUTES } from '@/app/router/routes';
import type {
  GroupedTasksData,
  MyTask,
  MyTaskColumn,
  MyTasksPageConfig,
  ResolveTasksRoleInput,
  TasksApiRole,
} from '../types/myTasks.types';

export function resolveTasksRole(user: ResolveTasksRoleInput): TasksApiRole | null {
  if (user.actor === 'employee') {
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
      case 'seo-employee':
        return `/v1/seo/employee/projects/${projectId}/tasks`;
      case 'project-manager':
        return `/v1/pm/projects/${projectId}/tasks`;
      case 'seo-manager':
        return `/v1/seo/manager/projects/${projectId}/tasks`;
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

export function getTasksQueryParams(
  tasksRole: TasksApiRole,
  projectId?: number | string,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  // My Tasks is always assignee-scoped — not permission-scoped.
  params.mine = 1;
  if (projectId && !getTasksEndpoint(tasksRole, projectId).includes(`/${projectId}/`)) {
    params.project_id = projectId;
  }
  return params;
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

function normalizeTask(raw: RawTaskWire): MyTask {
  return {
    id:               raw.id,
    uuid:             raw.uuid ?? String(raw.id),
    taskNumber:       raw.taskNumber ?? raw.id,
    title:            raw.title,
    description:      raw.description ?? null,
    status:           raw.status,
    statusLabel:      raw.statusLabel ?? raw.status,
    priority:         raw.priority,
    priorityLabel:    raw.priorityLabel ?? raw.priority,
    dueDate:          raw.dueDate ?? null,
    estimatedHours:   raw.estimatedHours ?? null,
    project:          raw.project
      ? { id: Number(raw.project.id), name: raw.project.name }
      : undefined,
    phase:            normalizePhase(raw.phase),
    assignee:         normalizeAssignee(raw),
    completedAt:      raw.completedAt ?? null,
    attachmentsCount: raw.attachmentsCount,
    commentsCount:    raw.commentsCount,
    createdAt:        raw.createdAt ?? '',
    updatedAt:        raw.updatedAt ?? '',
  };
}

/** Prefer API `columns`; fall back to legacy SEO `phases` grouped by status. */
export function normalizeGroupedTasks(payload: unknown): GroupedTasksData {
  const data = (payload ?? {}) as Record<string, unknown>;

  if (Array.isArray(data.columns)) {
    const columns = (data.columns as Array<{ status: string; statusLabel: string; tasks: RawTaskWire[] }>)
      .map((col) => ({
        status:      col.status,
        statusLabel: col.statusLabel,
        tasks:       (col.tasks ?? []).map(normalizeTask),
      }));
    return { columns, total: Number(data.total ?? countTasks(columns)) };
  }

  if (Array.isArray(data.phases)) {
    const flat = (data.phases as Array<{ tasks?: RawTaskWire[] }>)
      .flatMap((p) => p.tasks ?? [])
      .map(normalizeTask);
    return { columns: groupTasksByStatus(flat), total: Number(data.total ?? flat.length) };
  }

  return { columns: [], total: 0 };
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
