export type TaskStatus   = 'pending' | 'inProgress' | 'review' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id:               string;
  projectId:        string;
  title:            string;
  description?:     string;
  categoryAr:       string;
  categoryEn:       string;
  priority:         TaskPriority;
  assigneeName:     string;
  assigneeInitial:  string;
  assigneeColor:    string;
  dueDate:          string;
  estimatedHours?:  number;
  status:           TaskStatus;
  taskNumber:       string;
}
