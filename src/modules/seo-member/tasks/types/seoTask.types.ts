export type SeoTaskStatus   = 'pending' | 'inProgress' | 'completed' | 'blocked';
export type SeoTaskPriority = 'high' | 'normal' | 'low';

export interface SeoTask {
  id: number;
  taskNumber: number;
  title: string;
  phase: string | null;
  taskType: string;
  taskTypeLabel: string;
  status: SeoTaskStatus;
  statusLabel: string;
  priority: SeoTaskPriority;
  priorityLabel: string;
  dueDate: string | null;
  description: string | null;
}

export interface SeoTaskPhase {
  phase: string;
  tasks: SeoTask[];
}

export interface SeoTaskListResponse {
  status: string;
  message: string;
  data: {
    phases: SeoTaskPhase[];
    total: number;
  };
}
