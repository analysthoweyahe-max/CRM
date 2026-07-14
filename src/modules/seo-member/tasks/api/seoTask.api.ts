import { http } from '@/shared/services/http.service';
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
      params,
    });
    return flattenPhases(res.data);
  },

  async listByProject(projectId: string, params?: { status?: string; search?: string }) {
    const res = await http.get<RawSeoTaskListResponse>(
      `/v1/seo/projects/${projectId}/tasks`,
      { params },
    );
    return flattenPhases(res.data);
  },
};
