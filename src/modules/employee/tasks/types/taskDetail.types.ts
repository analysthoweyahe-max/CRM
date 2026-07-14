import type { EmpTaskPriority, EmpTaskStatus } from './employeeTask.types';
import type { MentionRef } from '@/shared/components/chat';

export interface TaskDetail {
  id:             string;
  projectId:      string;
  title:          string;
  description:    string;
  project:        string;
  stage:          string | null;
  createdAt:      string | null;
  deadline:       string;
  priority:       EmpTaskPriority;
  status:         EmpTaskStatus;
  allocatedHours: number;
  dueAt?:         string | null;
  isOverdue?:     boolean;
  isDelayed?:     boolean;
  overdueLabel?:  string | null;
  canExtend?:     boolean;
}

export interface UpdateTaskPayload {
  title:          string;
  description:    string;
  priority:       EmpTaskPriority;
  deadline:       string;
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
  mentions?: MentionRef[];
}

export interface TaskSession {
  id:            string;
  date:          string;
  from:          string;
  to:            string;
  durationHours: number;
}
