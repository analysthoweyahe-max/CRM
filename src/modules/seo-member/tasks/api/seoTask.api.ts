import { http } from '@/shared/services/http.service';
import type { SeoTask, SeoTaskStatus, SeoTaskPriority } from '../types/seoTask.types';

/* Raw backend shape — GET /v1/seo/employee/tasks?mine=1 and
   GET /v1/seo/employee/projects/{project}/tasks?mine=1.
   Mirrors the confirmed PM-employee shape: grouped into status columns,
   same as the SEO manager's task resource — NOT a flat paginated list. */
export interface RawSeoTaskRef {
  id:   string | number;
  name: string;
}

export interface RawSeoTask {
  id:             number;
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
}

export interface RawSeoTaskPhaseGroup {
  phase: string;
  tasks: RawSeoTask[];
}

export interface RawSeoTaskListResponse {
  status:  string;
  message: string;
  data: {
    phases: RawSeoTaskPhaseGroup[];
    total:  number;
  };
}

export const STATUS_FROM_WIRE: Record<string, SeoTaskStatus> = {
  pending:     'pending',
  in_progress: 'inProgress',
  in_review:   'inReview',
  completed:   'completed',
  blocked:     'blocked',
};

export const STATUS_TO_WIRE: Record<SeoTaskStatus, string> = {
  pending:    'pending',
  inProgress: 'in_progress',
  inReview:   'in_review',
  completed:  'completed',
  blocked:    'blocked',
};

const PRIORITY_FROM_WIRE: Record<string, SeoTaskPriority> = {
  high:   'high',
  medium: 'normal',
  normal: 'normal',
  low:    'low',
};

export function toSeoTask(raw: RawSeoTask): SeoTask {
  return {
    id:            raw.id,
    taskNumber:    raw.taskNumber,
    title:         raw.title,
    phase:         raw.phase ?? null,
    taskType:      raw.taskType ?? '',
    taskTypeLabel: raw.taskTypeLabel ?? '',
    status:        STATUS_FROM_WIRE[raw.status] ?? 'pending',
    statusLabel:   raw.statusLabel,
    priority:      PRIORITY_FROM_WIRE[raw.priority] ?? 'normal',
    priorityLabel: raw.priorityLabel,
    dueDate:       raw.dueDate ?? null,
    description:   raw.description ?? null,
    project:       raw.project ? { id: String(raw.project.id), name: raw.project.name } : null,
  };
}

function flattenPhases(res: RawSeoTaskListResponse) {
  const tasks = res.data.phases.flatMap((p) => p.tasks).map(toSeoTask);
  return { tasks, total: res.data.total };
}

export const seoTaskApi = {
  // Cross-project "my tasks" list — GET /v1/seo/employee/tasks?mine=1
  async list(params?: { status?: string; search?: string }) {
    const res = await http.get<RawSeoTaskListResponse>('/v1/seo/employee/tasks', {
      params: { mine: 1, ...params },
    });
    return flattenPhases(res.data);
  },

  // "My tasks" scoped to one project — GET /v1/seo/employee/projects/{project}/tasks?mine=1
  async listByProject(projectId: string, params?: { status?: string; search?: string }) {
    const res = await http.get<RawSeoTaskListResponse>(
      `/v1/seo/employee/projects/${projectId}/tasks`,
      { params: { mine: 1, ...params } },
    );
    return flattenPhases(res.data);
  },
};
