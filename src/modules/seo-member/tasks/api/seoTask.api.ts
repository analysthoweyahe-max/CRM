import { http } from '@/shared/services/http.service';
import { parseImportantLinks } from '@/shared/utils/importantLinks.utils';
import { myTasksApi } from '@/shared/modules/my-tasks/api/myTasks.api';
import type { SeoTask, SeoTaskPriority } from '../types/seoTask.types';

/* Raw backend shape — GET /v1/seo/employee/tasks?mine=1 and
   GET /v1/seo/projects/{project}/tasks.
   Mirrors the confirmed PM-employee shape: grouped into status columns,
   same as the SEO manager's task resource — NOT a flat paginated list. */
export interface RawSeoTaskRef {
  id:   string | number;
  name: string;
}

export interface RawSeoTask {
  id:             number;
  uuid?:          string;
  taskNumber:     number;
  title:          string;
  description?:   string | null;
  status:         string;
  statusLabel:    string;
  priority:       string;
  priorityLabel:  string;
  dueDate?:       string | null;
  taskType?:      string;
  taskTypeLabel?: string;
  phase?:         string | null;
  project?:       RawSeoTaskRef | null;
  dueAt?:         string | null;
  isOverdue?:     boolean;
  isDelayed?:     boolean;
  overdueLabel?:  string | null;
  canExtend?:     boolean;
  importantLinks?: string[];
  important_links?: string[];
}

export interface RawSeoTaskPhaseGroup {
  phase: string;
  tasks: RawSeoTask[];
}

export interface RawSeoTaskStatusColumn {
  status:       string;
  statusLabel?: string;
  tasks:        RawSeoTask[];
}

export interface RawSeoTaskListResponse {
  status:  string;
  message: string;
  data: {
    phases?:  RawSeoTaskPhaseGroup[];
    columns?: RawSeoTaskStatusColumn[];
    tasks?:   RawSeoTask[];
    total?:   number;
  };
}

const PRIORITY_FROM_WIRE: Record<string, SeoTaskPriority> = {
  high:   'high',
  medium: 'normal',
  normal: 'normal',
  low:    'low',
};

export function toSeoTask(raw: RawSeoTask): SeoTask {
  return {
    id:            raw.id,
    uuid:          raw.uuid ?? String(raw.id),
    taskNumber:    raw.taskNumber,
    title:         raw.title,
    phase:         raw.phase ?? null,
    taskType:      raw.taskType ?? '',
    taskTypeLabel: raw.taskTypeLabel ?? '',
    status:        raw.status,
    statusLabel:   raw.statusLabel,
    priority:      PRIORITY_FROM_WIRE[raw.priority] ?? 'normal',
    priorityLabel: raw.priorityLabel,
    dueDate:       raw.dueDate ?? null,
    description:   raw.description ?? null,
    project:       raw.project ? { id: String(raw.project.id), name: raw.project.name } : null,
    dueAt:         raw.dueAt ?? null,
    isOverdue:     raw.isOverdue,
    isDelayed:     raw.isDelayed,
    overdueLabel:  raw.overdueLabel ?? null,
    canExtend:     raw.canExtend,
    importantLinks: parseImportantLinks(raw),
  };
}

function flattenPhases(res: RawSeoTaskListResponse) {
  const data = res.data ?? { phases: [] };
  const fromPhases  = (data.phases  ?? []).flatMap((p) => p.tasks ?? []);
  const fromColumns = (data.columns ?? []).flatMap((c) => c.tasks ?? []);
  const fromFlat    = Array.isArray(data.tasks) ? data.tasks : [];
  const rawTasks = fromPhases.length > 0
    ? fromPhases
    : fromColumns.length > 0
      ? fromColumns
      : fromFlat;
  const tasks = rawTasks.map(toSeoTask);
  return { tasks, total: data.total ?? tasks.length };
}

export const seoTaskApi = {
  // Cross-project "my tasks" list — GET /v1/seo/employee/tasks?mine=1
  // Prefer `listMineAggregated` on employee home — this aggregate is often empty.
  async list(params?: { status?: string; search?: string }) {
    const res = await http.get<RawSeoTaskListResponse>('/v1/seo/employee/tasks', {
      params,
    });
    return flattenPhases(res.data);
  },

  /**
   * Aggregate via confirmed membership + per-project endpoints, then flatMap.
   * Same approach as PM employee tasks — the cross-project aggregate is unreliable.
   */
  async listMineAggregated() {
    const projects = await myTasksApi.listEmployeeProjects('seo-employee');
    const nested = await Promise.all(
      projects.map(async (project) => {
        try {
          const res = await http.get<RawSeoTaskListResponse>(
            `/v1/seo/employee/projects/${project.id}/tasks`,
          );
          const { tasks } = flattenPhases(res.data);
          return tasks.map((t) => ({
            ...t,
            project: t.project ?? { id: String(project.id), name: project.name },
          }));
        } catch {
          return [];
        }
      }),
    );
    const tasks = nested.flatMap((t) => t);
    return { tasks, total: tasks.length };
  },

  /** Employee-scoped project tasks — `/v1/seo/projects/{id}/tasks` can 403. */
  async listByProject(projectId: string, params?: { status?: string; search?: string }) {
    const res = await http.get<RawSeoTaskListResponse>(
      `/v1/seo/employee/projects/${projectId}/tasks`,
      { params },
    );
    return flattenPhases(res.data);
  },
};
