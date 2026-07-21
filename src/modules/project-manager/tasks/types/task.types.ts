export type TaskStatus = string;
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
  id: string;
  /** Prefer this for API path params when present. */
  uuid?: string;
  projectId: string;
  title: string;
  description?: string;
  phaseId?: number;
  phaseName?: string;
  priority: TaskPriority;
  assigneeId?: string;
  assigneeName: string;
  assigneeInitial: string;
  assigneeColor: string;
  dueDate: string;
  estimatedHours?: number;
  estimatedMinutes?: number;
  /** Numeric status id from the task-statuses catalog — preferred for API writes. */
  statusId?: number | null;
  status: TaskStatus;
  taskNumber: string;
  dueAt?: string | null;
  isOverdue?: boolean;
  isDelayed?: boolean;
  overdueLabel?: string | null;
  canExtend?: boolean;
  importantLinks?: string[];
  /** ISO date/datetime from list API — used for client-side period filters. */
  createdAt?: string;
  createdById?: string;
  createdByName?: string;
}
