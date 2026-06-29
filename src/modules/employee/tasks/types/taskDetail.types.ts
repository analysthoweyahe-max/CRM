import type { EmpTaskPriority, EmpTaskStatus } from './employeeTask.types';

export interface TaskDetail {
  id:             string;
  titleAr:        string;
  titleEn:        string;
  descriptionAr:  string;
  descriptionEn:  string;
  projectAr:      string;
  projectEn:      string;
  stage:          string;
  assigneeAr:     string;
  assigneeEn:     string;
  assigneeInitials: string;
  createdByAr:    string;
  createdByEn:    string;
  startDate:      string;
  deadline:       string;
  priority:       EmpTaskPriority;
  status:         EmpTaskStatus;
  allocatedHours: number;
}

export interface TaskComment {
  id:        string;
  authorAr:  string;
  authorEn:  string;
  initials:  string;
  avatarBg:  string;
  body:      string;
  createdAt: string;
  isMine:    boolean;
}

export interface TaskSession {
  id:            string;
  date:          string;
  from:          string;
  to:            string;
  durationHours: number;
}
