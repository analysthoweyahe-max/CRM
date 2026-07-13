export type TaskStatus   = 'pending' | 'in_progress' | 'needs_review' | 'completed';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
  id:               string;
  /** Prefer this for API path params when present. */
  uuid?:            string;
  projectId:        string;
  title:            string;
  description?:     string;
  phaseId?:         number;
  phaseName?:       string;
  priority:         TaskPriority;
  assigneeId?:      string;
  assigneeName:     string;
  assigneeInitial:  string;
  assigneeColor:    string;
  dueDate:          string;
  estimatedHours?:  number;
  estimatedMinutes?: number;
  status:           TaskStatus;
  taskNumber:       string;
}
