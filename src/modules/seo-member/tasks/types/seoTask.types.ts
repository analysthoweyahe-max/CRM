/** The admin-configured `seo_task_statuses` catalog — dynamic, not a
 *  fixed set. Fetch labels/colors from `useSeoTaskLookups` (GET
 *  /v1/seo/task-statuses). Prefer numeric `statusId` for API writes. */
export type SeoTaskStatus = string;
export type SeoTaskPriority = 'high' | 'normal' | 'low';

export interface SeoTaskProjectRef {
  id: string;
  name: string;
}

export interface SeoTask {
  id: number;
  uuid: string;
  taskNumber: number;
  title: string;
  phase: string | null;
  taskType: string;
  taskTypeLabel: string;
  statusId?: number | null;
  status: SeoTaskStatus;
  statusLabel: string;
  priority: SeoTaskPriority;
  priorityLabel: string;
  dueDate: string | null;
  description: string | null;
  project: SeoTaskProjectRef | null;
  dueAt?: string | null;
  isOverdue?: boolean;
  isDelayed?: boolean;
  overdueLabel?: string | null;
  canExtend?: boolean;
  importantLinks?: string[];
}

export interface CreateSelfSeoTaskPayload {
  title: string;
  phase: string;
  phaseId?: number;
  phase_id?: number;
  description?: string;
  priority: SeoTaskPriority;
  due_date?: string;
  estimated_hours?: number;
  importantLinks?: string[];
}
