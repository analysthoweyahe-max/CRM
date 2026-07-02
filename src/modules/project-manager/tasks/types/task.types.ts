export type TaskStatus   = 'pending' | 'in_progress' | 'needs_review' | 'completed';
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
  id:               string;
  projectId:        string;
  title:            string;
  description?:     string;
  phaseId?:         number;
  phaseName?:       string;
  priority:         TaskPriority;
  assigneeName:     string;
  assigneeInitial:  string;
  assigneeColor:    string;
  dueDate:          string;
  estimatedHours?:  number;
  status:           TaskStatus;
  taskNumber:       string;
}
