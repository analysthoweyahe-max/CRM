export type SeoTaskStatus   = 'pending' | 'inProgress' | 'inReview' | 'completed' | 'blocked';
export type SeoTaskPriority = 'high' | 'normal' | 'low';

export interface SeoTaskProjectRef {
  id:   string;
  name: string;
}

export interface SeoTask {
  id:            number;
  taskNumber:    number;
  title:         string;
  phase:         string | null;
  taskType:      string;
  taskTypeLabel: string;
  status:        SeoTaskStatus;
  statusLabel:   string;
  priority:      SeoTaskPriority;
  priorityLabel: string;
  dueDate:       string | null;
  description:   string | null;
  project:       SeoTaskProjectRef | null;
}

export interface CreateSelfSeoTaskPayload {
  title:            string;
  phase:            string;
  description?:     string;
  priority:         SeoTaskPriority;
  due_date?:        string;
  estimated_hours?: number;
}
